// Small, one-time movements keep the guide readable while adding some life.
(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const landing = document.getElementById('landing-page');
    if (!landing || reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const targets = landing.querySelectorAll('.guide-section-heading, .guide-category, .guide-pick, .guide-note');
    const reveal = element => {
        element.classList.remove('reveal-pending');
        element.classList.add('revealed');
    };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            observer.unobserve(entry.target);
        });
    }, { root: landing, threshold: 0.08 });

    targets.forEach((element, index) => {
        // Never hide content already in view; animate the lower sections as they enter.
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        element.style.setProperty('--reveal-delay', `${(index % 3) * 60}ms`);
        element.classList.add('reveal-pending');
        observer.observe(element);
    });
    reducedMotion.addEventListener('change', event => {
        if (!event.matches) return;
        observer.disconnect();
        targets.forEach(reveal);
    });
})();
