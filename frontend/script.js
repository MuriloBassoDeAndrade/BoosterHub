
    // ========== Menu mobile ==========
    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.getElementById("main-nav");

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // ========== Carrossel do hero ==========
    const slidesEl = document.getElementById("slides");
    const dotsEl = document.getElementById("dots");
    const totalSlides = slidesEl.children.length;
    const autoplayDelay = 6000;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let currentSlide = 0;
    let autoplayTimer = null;

    // Cria os pontos de navegação
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Ir para o slide ${i + 1}`);
      dot.addEventListener("click", () => {
        goToSlide(i);
        restartAutoplay();
      });
      dotsEl.appendChild(dot);
    }

    function goToSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;
      slidesEl.style.transform = `translateX(-${currentSlide * 100}%)`;
      [...dotsEl.children].forEach((dot, i) => {
        dot.setAttribute("aria-current", String(i === currentSlide));
      });
    }

    function restartAutoplay() {
      clearInterval(autoplayTimer);
      if (!prefersReducedMotion) {
        autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), autoplayDelay);
      }
    }

    // Suporte a gesto de arrastar no celular
    let touchStartX = 0;
    slidesEl.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slidesEl.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 50) {
        goToSlide(currentSlide + (diff < 0 ? 1 : -1));
        restartAutoplay();
      }
    });

    goToSlide(0);
    restartAutoplay();

    // ========== Rodapé ==========
    document.getElementById("year").textContent = new Date().getFullYear();