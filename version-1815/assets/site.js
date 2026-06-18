(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        var current = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("active", index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("active", index === current);
            });
        }

        function startHero() {
            if (slides.length <= 1) {
                return;
            }
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        var nextButton = document.querySelector(".hero-control.next");
        var prevButton = document.querySelector(".hero-control.prev");
        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(current + 1);
                startHero();
            });
        }
        if (prevButton) {
            prevButton.addEventListener("click", function () {
                showSlide(current - 1);
                startHero();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startHero();
            });
        });
        startHero();

        var searchInput = document.getElementById("site-search");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function filterCards(query) {
            var value = normalize(query);
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-card"));
            if (!cards.length) {
                return;
            }
            document.body.classList.toggle("has-query", Boolean(value));
            cards.forEach(function (card) {
                var content = normalize((card.dataset.title || "") + " " + (card.dataset.tags || "") + " " + card.textContent);
                var hide = Boolean(value) && content.indexOf(value) === -1;
                card.classList.toggle("is-hidden", hide);
                var previous = card.previousElementSibling;
                if (previous && previous.classList.contains("rank-number")) {
                    previous.classList.toggle("is-hidden", hide);
                }
            });
        }

        if (initialQuery) {
            filterCards(initialQuery);
        }
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                filterCards(searchInput.value);
            });
        }

        Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".play-cover");
            var stream = shell.getAttribute("data-stream");
            var started = false;

            function playVideo() {
                if (!video || !stream) {
                    return;
                }
                if (!started) {
                    started = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                }
                if (button) {
                    button.classList.add("hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        playVideo();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("hidden");
                    }
                });
            }
        });
    });
})();
