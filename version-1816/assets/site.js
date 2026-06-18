(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var navPanel = document.querySelector('[data-nav-panel]');

    if (navButton && navPanel) {
        navButton.addEventListener('click', function () {
            navPanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        showSlide(0);
        startHero();
    }

    var searchForm = document.querySelector('[data-search-form]');
    var resultBox = document.querySelector('[data-search-results]');
    var stateBox = document.querySelector('[data-search-state]');

    if (searchForm && resultBox && stateBox && Array.isArray(window.SEARCH_MOVIES)) {
        var input = searchForm.querySelector('[data-search-input]');
        var category = searchForm.querySelector('[data-category-filter]');
        var year = searchForm.querySelector('[data-year-filter]');
        var params = new URLSearchParams(window.location.search);

        input.value = params.get('q') || '';
        category.value = params.get('category') || '';
        year.value = params.get('year') || '';

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function renderCard(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card grid">',
                '<a href="' + item.url + '" class="movie-cover" aria-label="观看' + escapeHtml(item.title) + '">',
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="cover-shade"></span>',
                '<span class="play-dot">▶</span>',
                '<span class="duration">' + escapeHtml(item.duration) + '</span>',
                '</a>',
                '<div class="movie-info">',
                '<a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
                '<p>' + escapeHtml(item.desc) + '</p>',
                '<div class="movie-meta">',
                '<span>' + escapeHtml(item.categoryName) + '</span>',
                '<span>' + escapeHtml(item.year) + '</span>',
                '<span>' + escapeHtml(item.rating) + '分</span>',
                '</div>',
                '<div class="tag-row">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (match) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[match];
            });
        }

        function runSearch() {
            var keyword = normalize(input.value);
            var selectedCategory = category.value;
            var selectedYear = year.value;

            var results = window.SEARCH_MOVIES.filter(function (item) {
                var text = normalize([item.title, item.desc, item.genre, item.region, item.type, (item.tags || []).join('')].join(' '));
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var categoryMatch = !selectedCategory || item.category === selectedCategory;
                var yearMatch = !selectedYear || item.year === selectedYear;
                return keywordMatch && categoryMatch && yearMatch;
            }).slice(0, 120);

            if (!keyword && !selectedCategory && !selectedYear) {
                resultBox.innerHTML = '';
                stateBox.textContent = '请输入关键词或选择筛选条件';
                return;
            }

            if (!results.length) {
                resultBox.innerHTML = '';
                stateBox.textContent = '未找到匹配内容，请调整关键词或筛选条件';
                return;
            }

            stateBox.textContent = '为你找到相关内容';
            resultBox.innerHTML = results.map(renderCard).join('');
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var nextParams = new URLSearchParams();

            if (input.value.trim()) {
                nextParams.set('q', input.value.trim());
            }

            if (category.value) {
                nextParams.set('category', category.value);
            }

            if (year.value) {
                nextParams.set('year', year.value);
            }

            var query = nextParams.toString();
            var nextUrl = window.location.pathname + (query ? '?' + query : '');
            window.history.replaceState(null, '', nextUrl);
            runSearch();
        });

        category.addEventListener('change', runSearch);
        year.addEventListener('change', runSearch);
        input.addEventListener('input', function () {
            window.clearTimeout(input.searchTimer);
            input.searchTimer = window.setTimeout(runSearch, 180);
        });

        runSearch();
    }
})();
