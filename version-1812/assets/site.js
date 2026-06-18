(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            const isOpen = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let activeSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeSlide);
        });
    }

    function restartHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = window.setInterval(function () {
                showSlide(activeSlide + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        showSlide(0);
        restartHero();
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(activeSlide - 1);
                restartHero();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeSlide + 1);
                restartHero();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartHero();
            });
        });
    }

    const filterInput = document.querySelector(".movie-filter-input");
    const yearSelect = document.querySelector(".movie-filter-select");
    const genreSelect = document.querySelector(".movie-filter-genre");
    const filterList = document.querySelector(".movie-filter-list");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        if (!filterList) {
            return;
        }
        const query = normalize(filterInput ? filterInput.value : "");
        const year = normalize(yearSelect ? yearSelect.value : "");
        const genre = normalize(genreSelect ? genreSelect.value : "");
        const cards = Array.from(filterList.querySelectorAll(".movie-card"));

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.year
            ].join(" "));
            const matchQuery = !query || haystack.indexOf(query) !== -1;
            const matchYear = !year || normalize(card.dataset.year) === year;
            const matchGenre = !genre || normalize(card.dataset.genre).indexOf(genre) !== -1;
            card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchGenre));
        });
    }

    if (filterInput || yearSelect || genreSelect) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q && filterInput) {
            filterInput.value = q;
        }
        [filterInput, yearSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
        applyFilters();
    }
})();
