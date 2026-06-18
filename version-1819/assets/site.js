(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
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
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var area = document.querySelector('[data-filter-area]');
    if (!area) {
      return;
    }
    var input = area.querySelector('[data-filter-input]');
    var selects = selectAll('[data-filter-select]', area);
    var cards = selectAll('[data-card]');
    var empty = document.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }

    function cardValue(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var filters = selects.map(function (select) {
        return {
          key: select.getAttribute('data-filter-select'),
          value: normalize(select.value)
        };
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = cardValue(card);
        var ok = !query || text.indexOf(query) !== -1;
        filters.forEach(function (item) {
          if (item.value && normalize(card.getAttribute('data-' + item.key)) !== item.value) {
            ok = false;
          }
        });
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  function initPlayer() {
    var cards = selectAll('[data-player]');
    cards.forEach(function (card) {
      var video = card.querySelector('video');
      var poster = card.querySelector('[data-player-poster]');
      var playButton = card.querySelector('[data-player-toggle]');
      var muteButton = card.querySelector('[data-player-mute]');
      var fullButton = card.querySelector('[data-player-full]');
      var state = card.querySelector('[data-player-state]');
      var source = card.getAttribute('data-src');
      var ready = false;
      var hls = null;

      if (!video || !source) {
        return;
      }

      function setState(text) {
        if (state) {
          state.textContent = text || '';
        }
      }

      function prepare() {
        if (ready) {
          return;
        }
        ready = true;
        setState('加载中');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setState('');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState('播放暂时不可用');
            }
          });
        } else {
          setState('当前浏览器暂不支持播放');
        }
      }

      function play() {
        prepare();
        var action = video.play();
        if (action && action.then) {
          action.then(function () {
            card.classList.add('is-playing');
            if (playButton) {
              playButton.textContent = 'Ⅱ';
            }
            setState('');
          }).catch(function () {
            setState('点击画面开始播放');
          });
        }
      }

      function toggle() {
        if (video.paused) {
          play();
        } else {
          video.pause();
          if (playButton) {
            playButton.textContent = '▶';
          }
        }
      }

      if (poster) {
        poster.addEventListener('click', play);
      }
      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        card.classList.add('is-playing');
        if (playButton) {
          playButton.textContent = 'Ⅱ';
        }
      });
      video.addEventListener('pause', function () {
        if (playButton) {
          playButton.textContent = '▶';
        }
      });
      if (playButton) {
        playButton.addEventListener('click', toggle);
      }
      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '🔇' : '🔊';
        });
      }
      if (fullButton) {
        fullButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (card.requestFullscreen) {
            card.requestFullscreen();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
