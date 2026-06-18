(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.site-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = 'search.html?q=' + encodeURIComponent(value);
    });
  });

  var carousel = document.getElementById('hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;

    var showSlide = function (index) {
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
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('.movie-filter-input');
  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-terms]'));

    var applyFilter = function (value) {
      var q = value.trim().toLowerCase();
      cards.forEach(function (card) {
        var terms = (card.getAttribute('data-terms') || '').toLowerCase();
        card.classList.toggle('is-hidden', q && terms.indexOf(q) === -1);
      });
    };

    if (initial) {
      filterInput.value = initial;
      applyFilter(initial);
    }

    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }
})();

window.initMoviePlayer = function (streamUrl) {
  var video = document.getElementById('moviePlayer');
  var startButton = document.getElementById('playerStart');
  var shell = document.querySelector('.player-shell');
  var hlsInstance = null;
  var initialized = false;

  var launch = function () {
    if (!video) {
      return;
    }

    if (!initialized) {
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    if (shell) {
      shell.classList.add('is-playing');
    }

    if (startButton) {
      startButton.hidden = true;
    }

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  if (startButton) {
    startButton.addEventListener('click', launch);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        launch();
      }
    });
  }
};
