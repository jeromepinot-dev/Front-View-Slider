(function () {
  const mediaQuery = window.matchMedia("(min-width: 768px)");
  let cleanupFn = null;

  function initCarousel() {

    // Récupère tous les slides (y compris le slide accueil "home-slide")
    const allSlides = document.querySelectorAll('.menu-item');
    const normalSlides = Array.from(allSlides).filter(s => !s.classList.contains('home-slide'));

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');

    let current = 0;
    let lastClick = 0;
    const CLICK_DELAY = 1000;
    let slideListeners = [];

    function updateCarousel() {
      // 🔄 0 : nettoyer les anciens listeners
      slideListeners.forEach(({ slide, listener }) => {
        slide.removeEventListener('click', listener);
      });
      slideListeners = [];

      const currentSlide = allSlides[current];
      const isHome = currentSlide.classList.contains('home-slide');

      // 🔄 1 : reset toutes les classes
      allSlides.forEach(slide =>
        slide.classList.remove(
          'active',
          'behind-left-1',
          'behind-left-2',
          'behind-right-1',
          'behind-right-2',
          'behind-mid'
        )
      );

      // 1bis : ajouter les nouveaux listeners
      allSlides.forEach((slide, index) => {
        const listener = () => {
          if (index !== current) {
            current = index;
            updateCarousel();
          }
        };
        slide.addEventListener('click', listener);
        slideListeners.push({ slide, listener });
      });

      // 2 : positions selon si home ou pas
      const positions = isHome
        ? [
          { offset: 0, cls: 'active' },
          { offset: -1, cls: 'behind-left-1' },
          { offset: -2, cls: 'behind-left-2' },
          { offset: -3, cls: 'behind-mid' },
          { offset: 1, cls: 'behind-right-1' },
          { offset: 2, cls: 'behind-right-2' }
        ]
        : [
          { offset: 0, cls: 'active' },
          { offset: -1, cls: 'behind-left-1' },
          { offset: -2, cls: 'behind-left-2' },
          { offset: 1, cls: 'behind-right-1' },
          { offset: 2, cls: 'behind-right-2' }
        ];

      const slides = isHome ? allSlides : normalSlides;
      const total = slides.length;
      const baseIndex = isHome ? current : slides.indexOf(currentSlide);

      positions.forEach(({ offset, cls }) => {
        slides[(baseIndex + offset + total) % total].classList.add(cls);
      });
    }

    function safeNavigate(direction) {
      const now = Date.now();
      if (now - lastClick < CLICK_DELAY) return;
      lastClick = now;

      if (direction === 'next') {
        current = (current + 1) % allSlides.length;
      } else {
        current = (current - 1 + allSlides.length) % allSlides.length;
      }

      updateCarousel();
    }

    const onNext = () => safeNavigate('next');
    const onPrev = () => safeNavigate('prev');

    nextBtn.addEventListener('click', onNext);
    prevBtn.addEventListener('click', onPrev);
    window.addEventListener('resize', updateCarousel);

    // Premier affichage
    updateCarousel();

    // ⛔ Fonction de nettoyage
    return function cleanupCarousel() {

      // retirer listeners sur slides
      slideListeners.forEach(({ slide, listener }) => {
        slide.removeEventListener('click', listener);
      });
      slideListeners = [];

      // retirer listeners globaux
      nextBtn.removeEventListener('click', onNext);
      prevBtn.removeEventListener('click', onPrev);
      window.removeEventListener('resize', updateCarousel);

      // reset les classes
      allSlides.forEach(slide =>
        slide.classList.remove(
          'active',
          'behind-left-1',
          'behind-left-2',
          'behind-right-1',
          'behind-right-2',
          'behind-mid'
        )
      );
    };
  }

  function handleChange(e) {
    if (e.matches && !cleanupFn) {
      // passer en desktop → init
      cleanupFn = initCarousel();
    } else if (!e.matches && cleanupFn) {
      // quitter desktop → cleanup
      cleanupFn();
      cleanupFn = null;
    }
  }

  // init au chargement
  handleChange(mediaQuery);
  mediaQuery.addEventListener("change", handleChange);
})();
