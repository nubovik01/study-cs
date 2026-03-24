document.addEventListener("DOMContentLoaded", () => {
  const photoView = document.getElementById("photoView");
  const photoFull = document.getElementById("photoFull");
  const photoClose = document.getElementById("photoClose");
  const photoPrev = document.getElementById("photoPrev");
  const photoNext = document.getElementById("photoNext");
  const galleryImages = document.querySelectorAll(".photo-card img");
  let currentPhoto = 0;

  const openPhoto = (index) => {
    currentPhoto = (index + galleryImages.length) % galleryImages.length;
    photoFull.src = galleryImages[currentPhoto].src;
    photoFull.alt = galleryImages[currentPhoto].alt;
    photoView.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  galleryImages.forEach((image, index) => {
    image.addEventListener("click", () => openPhoto(index));
  });

  const closePhoto = () => {
    photoView.classList.remove("open");
    document.body.style.overflow = "";
  };

  photoClose.addEventListener("click", closePhoto);
  photoPrev.addEventListener("click", () => openPhoto(currentPhoto - 1));
  photoNext.addEventListener("click", () => openPhoto(currentPhoto + 1));
  photoView.addEventListener("click", (event) => {
    if (event.target === photoView) closePhoto();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && photoView.classList.contains("open")) {
      closePhoto();
    };

    if (event.key === "ArrowLeft" && photoView.classList.contains("open")) {
      openPhoto(currentPhoto - 1);
    };

    if (event.key === "ArrowRight" && photoView.classList.contains("open")) {
      openPhoto(currentPhoto + 1);
    };
  });
});