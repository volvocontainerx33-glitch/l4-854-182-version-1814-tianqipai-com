(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var links = qs('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    if (!slides.length) {
      return;
    }
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(index);
    start();
  }

  function cardMatches(card, query, type, region) {
    var haystack = [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-year')
    ].map(normalize).join(' ');
    var cardType = normalize(card.getAttribute('data-type'));
    var cardRegion = normalize(card.getAttribute('data-region'));
    var okQuery = !query || haystack.indexOf(query) > -1;
    var okType = !type || cardType.indexOf(type) > -1;
    var okRegion = !region || cardRegion.indexOf(region) > -1 || haystack.indexOf(region) > -1;
    return okQuery && okType && okRegion;
  }

  function initLocalFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var grid = qs('[data-filter-grid]', scope) || qs('[data-filter-grid]');
      if (!grid) {
        return;
      }
      var input = qs('[data-filter-search]', panel);
      var type = qs('[data-filter-type]', panel);
      var region = qs('[data-filter-region]', panel);
      var empty = qs('[data-filter-empty]', panel);
      var cards = qsa('[data-card]', grid);

      function apply() {
        var query = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;
        cards.forEach(function (card) {
          var matched = cardMatches(card, query, typeValue, regionValue);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card compact" data-card>',
      '<a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="movie-year">' + escapeHtml(movie.year) + '</span>',
      '<span class="movie-type">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.regionGroup) + '</span><span>' + escapeHtml(movie.genreFirst) + '</span></div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-tags">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function initGlobalSearch() {
    var root = qs('[data-global-search]');
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var input = qs('[data-global-search-input]', root);
    var type = qs('[data-global-search-type]', root);
    var region = qs('[data-global-search-region]', root);
    var results = qs('[data-global-search-results]', root);
    var empty = qs('[data-global-search-empty]', root);

    function matches(movie, query, typeValue, regionValue) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.regionGroup,
        movie.type,
        movie.genre,
        movie.year,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));
      var okQuery = !query || haystack.indexOf(query) > -1;
      var okType = !typeValue || normalize(movie.type).indexOf(typeValue) > -1;
      var okRegion = !regionValue || normalize(movie.region).indexOf(regionValue) > -1 || normalize(movie.regionGroup).indexOf(regionValue) > -1;
      return okQuery && okType && okRegion;
    }

    function render() {
      var query = normalize(input && input.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        return matches(movie, query, typeValue, regionValue);
      });
      results.innerHTML = list.map(movieCardTemplate).join('');
      if (empty) {
        empty.hidden = list.length !== 0;
      }
    }

    [input, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });
    render();
  }

  function initializeMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var source = config.source;
    if (!video || !overlay || !source) {
      return;
    }
    var hls = null;
    var attached = false;
    var ready = false;
    var queuedPlay = false;

    function hideOverlay() {
      overlay.classList.add('is-hidden');
    }

    function showOverlay() {
      overlay.classList.remove('is-hidden');
    }

    function tryPlay() {
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          showOverlay();
        });
      }
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          if (queuedPlay) {
            tryPlay();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showOverlay();
          }
        });
        return;
      }
      video.src = source;
      ready = true;
      video.load();
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      hideOverlay();
      attachSource();
      if (ready) {
        tryPlay();
      } else {
        queuedPlay = true;
      }
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!attached) {
        startPlayback();
      }
    });
    video.addEventListener('play', hideOverlay);
    video.addEventListener('loadedmetadata', function () {
      ready = true;
      if (queuedPlay) {
        tryPlay();
      }
    });
    video.addEventListener('error', showOverlay);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initializeMoviePlayer = initializeMoviePlayer;

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeroSlider();
    initLocalFilters();
    initGlobalSearch();
  });
})();
