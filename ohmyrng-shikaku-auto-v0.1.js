(() => {
  const OVERLAY_ID = 'shikaku-solver-overlay';
  const BUTTON_ID = 'shikaku-solver-toggle';
  document.getElementById(OVERLAY_ID)?.remove();
  document.getElementById(BUTTON_ID)?.remove();
  if (window.__shikakuOnResize) window.removeEventListener('resize', window.__shikakuOnResize);
  if (window.__shikakuObs) window.__shikakuObs.disconnect();

  const table = document.querySelector('table[aria-label="Shikaku grid"]');
  if (!table) return console.error('Table with shikaku not found.');

  const cells = [...table.querySelectorAll('td[data-cell]')].sort((a, b) => +a.dataset.cell - +b.dataset.cell);
  const N = Math.round(Math.sqrt(cells.length));

  // --- 1. Чтение цифр ---
  const clues = [];
  cells.forEach(td => {
    const t = td.textContent.trim();
    if (/^\d+$/.test(t)) {
      const idx = +td.dataset.cell;
      clues.push({ idx, r: Math.floor(idx / N), c: idx % N, n: +t });
    }
  });
  const clueAt = new Map(clues.map(c => [c.idx, c]));

  // --- 2. Все возможные прямоугольники для каждой цифры ---
  const rects = [];
  clues.forEach((cl, ci) => {
    for (let h = 1; h <= cl.n; h++) {
      if (cl.n % h) continue;
      const w = cl.n / h;
      if (h > N || w > N) continue;
      for (let r0 = cl.r - h + 1; r0 <= cl.r; r0++) {
        for (let c0 = cl.c - w + 1; c0 <= cl.c; c0++) {
          if (r0 < 0 || c0 < 0 || r0 + h > N || c0 + w > N) continue;
          const list = [];
          let ok = true;
          for (let r = r0; r < r0 + h && ok; r++) {
            for (let c = c0; c < c0 + w; c++) {
              const idx = r * N + c;
              if (idx !== cl.idx && clueAt.has(idx)) { ok = false; break; }
              list.push(idx);
            }
          }
          if (ok) rects.push({ ci, r0, c0, h, w, cells: list });
        }
      }
    }
  });

  const cellRects = Array.from({ length: N * N }, () => []);
  rects.forEach((rc, i) => rc.cells.forEach(idx => cellRects[idx].push(i)));

  // --- 3. Поиск решения ---
  const owner = new Array(N * N).fill(-1);
  const chosen = [];
  const free = rc => rc.cells.every(i => owner[i] === -1);

  function solve() {
    let best = -1, bestList = null;
    for (let i = 0; i < N * N; i++) {
      if (owner[i] !== -1) continue;
      const list = cellRects[i].filter(k => free(rects[k]));
      if (list.length === 0) return false;
      if (!bestList || list.length < bestList.length) {
        best = i; bestList = list;
        if (list.length === 1) break;
      }
    }
    if (best === -1) return true;
    for (const k of bestList) {
      const rc = rects[k];
      rc.cells.forEach(i => (owner[i] = k));
      chosen.push(k);
      if (solve()) return true;
      chosen.pop();
      rc.cells.forEach(i => (owner[i] = -1));
    }
    return false;
  }

  const t0 = performance.now();
  if (!solve()) return console.error('Решение не найдено 😕');
  console.log(`Solved in ${(performance.now() - t0).toFixed(1)} ms, rectangles: ${chosen.length}`);

  // --- 4. Отрисовка поверх поля ---
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:99999;';
  document.body.appendChild(overlay);

  const boxes = chosen.map((k, i) => {
    const hue = (i * 137.508) % 360;
    const el = document.createElement('div');
    el.style.cssText = `
      position:absolute; box-sizing:border-box; border-radius:6px;
      border:2.5px solid hsl(${hue} 70% 50%);
      background:hsl(${hue} 70% 60% / 0.28);
    `;
    overlay.appendChild(el);
    const rc = rects[k];
    return { el, rc, key: `${rc.r0 * N + rc.c0}:${rc.h}x${rc.w}` };
  });

  function layout() {
    const sx = window.scrollX, sy = window.scrollY;
    boxes.forEach(({ el, rc }) => {
      const a = cells[rc.r0 * N + rc.c0].getBoundingClientRect();
      const b = cells[(rc.r0 + rc.h - 1) * N + (rc.c0 + rc.w - 1)].getBoundingClientRect();
      el.style.left = a.left + sx + 'px';
      el.style.top = a.top + sy + 'px';
      el.style.width = b.right - a.left + 'px';
      el.style.height = b.bottom - a.top + 'px';
    });
  }
  layout();
  window.__shikakuOnResize = layout;
  window.addEventListener('resize', layout);

  // --- 5. Определение нарисованных игроком прямоугольников ---
  const SIZE_RE = /calc\(\s*(\d+)\s*\*\s*100%/;
  function playerRects() {
    const set = new Set();
    cells.forEach(td => {
      const idx = +td.dataset.cell;
      td.querySelectorAll('span').forEach(sp => {
        const mw = SIZE_RE.exec(sp.style.width || '');
        const mh = SIZE_RE.exec(sp.style.height || '');
        if (!mw || !mh) return;
        if (/border-dashed/.test(sp.className)) return;
        set.add(`${idx}:${mh[1]}x${mw[1]}`);
      });
    });
    return set;
  }

  // --- 6. Минималистичная кнопка ---
  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Показать или скрыть подсказку');
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
         style="display:block;pointer-events:none">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
      <line data-slash x1="3.5" y1="3.5" x2="20.5" y2="20.5"/>
    </svg>
  `;
  const slash = btn.querySelector('[data-slash]');
  const BG = 'rgba(18,18,18,0.82)';
  const BG_HOVER = 'rgba(32,32,32,0.95)';
  btn.style.cssText = `
    all:unset; box-sizing:border-box;
    position:fixed; right:16px; bottom:16px; z-index:100000;
    width:40px; height:40px;
    display:grid; place-items:center;
    border:1px solid rgba(255,255,255,0.10); border-radius:12px;
    background:${BG}; color:#f2f2f2;
    cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent;
    backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
    box-shadow:0 4px 18px rgba(0,0,0,0.30);
    transition:background .15s, border-color .15s, color .15s, transform .12s;
  `;

  let visible = true;
  let solved = false;
  const refresh = () => {
    overlay.style.display = visible && !solved ? '' : 'none';
    btn.style.display = solved ? 'none' : 'grid';
    btn.title = visible ? 'Скрыть подсказку' : 'Показать подсказку';
    btn.style.color = visible ? '#f2f2f2' : '#7a7a7a';
    slash.style.display = visible ? 'none' : '';
    if (visible && !solved) layout();
  };
  btn.addEventListener('click', () => { visible = !visible; refresh(); });
  btn.addEventListener('mouseenter', () => {
    btn.style.background = BG_HOVER;
    btn.style.borderColor = 'rgba(255,255,255,0.22)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = BG;
    btn.style.borderColor = 'rgba(255,255,255,0.10)';
    btn.style.transform = 'none';
  });
  btn.addEventListener('mousedown', () => (btn.style.transform = 'scale(0.93)'));
  btn.addEventListener('mouseup', () => (btn.style.transform = 'none'));
  btn.addEventListener('focus', () => (btn.style.outline = '2px solid rgba(255,255,255,0.35)'));
  btn.addEventListener('blur', () => (btn.style.outline = 'none'));
  document.body.appendChild(btn);

  // --- 7. Обновление при любых изменениях страницы ---
  let scheduled = false;
  function update() {
    scheduled = false;
    const nowSolved = !table.isConnected || document.body.textContent.includes('Solved in');
    if (nowSolved !== solved) { solved = nowSolved; refresh(); }
    if (solved) return;

    const mine = playerRects();
    boxes.forEach(({ el, key }) => {
      el.style.display = mine.has(key) ? 'none' : '';
    });
    if (visible) layout();
  }
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  const obs = new MutationObserver(schedule);
  obs.observe(document.body, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ['style', 'class', 'aria-label']
  });
  window.__shikakuObs = obs;
  window.addEventListener('scroll', schedule, { passive: true });

  refresh();
  update();

  window.__shikakuDebug = () => console.log('Your rectangles:', [...playerRects()], 'Hints:', boxes.map(b => b.key));
  window.__shikakuClear = () => {
    obs.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', layout);
    overlay.remove();
    btn.remove();
  };
  console.log('Hide hint and button: __shikakuClear(). Debug: __shikakuDebug()');
})();