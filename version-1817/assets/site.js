(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        show(0);
        play();
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function initFilters() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        var region = document.querySelector("[data-filter-region]");
        var type = document.querySelector("[data-filter-type]");
        var year = document.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        if (input && getQuery("q")) {
            input.value = getQuery("q");
        }

        function valueOf(el) {
            return el ? el.value.trim().toLowerCase() : "";
        }

        function apply() {
            var q = valueOf(input);
            var r = valueOf(region);
            var t = valueOf(type);
            var y = valueOf(year);
            var shown = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" ").toLowerCase();
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && String(card.getAttribute("data-region") || "").toLowerCase() !== r) {
                    ok = false;
                }
                if (t && String(card.getAttribute("data-type") || "").toLowerCase() !== t) {
                    ok = false;
                }
                if (y && String(card.getAttribute("data-year") || "").toLowerCase() !== y) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        [input, region, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");
        var configEl = document.getElementById("player-config");
        if (!player || !configEl) {
            return;
        }
        var config;
        try {
            config = JSON.parse(configEl.textContent || "{}");
        } catch (error) {
            config = {};
        }
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var message = player.querySelector("[data-player-message]");
        var hls = null;
        var initialized = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function bindMedia() {
            if (!video || !config.source || initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("视频暂时无法加载，请稍后再试");
                    }
                });
            } else {
                video.src = config.source;
            }
        }

        function start() {
            bindMedia();
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    setMessage("点击视频画面继续播放");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
