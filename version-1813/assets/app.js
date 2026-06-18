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
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var category = scope.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      if (!cards.length) {
        return;
      }

      function valueOf(node) {
        return node ? String(node.value || "").trim().toLowerCase() : "";
      }

      function apply() {
        var query = valueOf(input);
        var selectedYear = valueOf(year);
        var selectedType = valueOf(type);
        var selectedCategory = valueOf(category);
        var visible = 0;

        cards.forEach(function (card) {
          var search = String(card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = String(card.getAttribute("data-year") || "").toLowerCase();
          var cardType = String(card.getAttribute("data-type") || "").toLowerCase();
          var cardCategory = String(card.getAttribute("data-category") || "").toLowerCase();
          var matched = true;

          if (query && search.indexOf(query) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }
          if (selectedCategory && cardCategory !== selectedCategory) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, type, category].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var source = player.getAttribute("data-video");
    var playButtons = Array.prototype.slice.call(player.querySelectorAll("[data-play]"));
    var status = player.querySelector("[data-player-status]");
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function attachSource(callback) {
      if (loaded) {
        if (callback) {
          callback();
        }
        return;
      }
      loaded = true;
      setStatus("正在加载");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("");
          if (callback) {
            callback();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("播放暂时不可用");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setStatus("");
          if (callback) {
            callback();
          }
        }, { once: true });
      } else {
        video.src = source;
        setStatus("");
        if (callback) {
          callback();
        }
      }
    }

    function play() {
      attachSource(function () {
        video.controls = true;
        player.classList.add("player-ready");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("player-ready");
          });
        }
      });
    }

    playButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("player-ready");
      setStatus("");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        player.classList.remove("player-ready");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
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
