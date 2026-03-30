const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".program-card, .news-item, .intro, .metric, .photo-card").forEach(element => {
  element.classList.add("hidden");
  observer.observe(element);
});

document.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 10;
  const y = (event.clientY / window.innerHeight - 0.5) * 10;

  document.querySelectorAll(".program-card").forEach(card => {
    card.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  });
});