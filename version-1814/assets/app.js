(function () {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showHeroSlide(heroIndex + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    showHeroSlide(0);
    startHeroTimer();

    if (prev) {
      prev.addEventListener("click", function () {
        showHeroSlide(heroIndex - 1);
        startHeroTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showHeroSlide(heroIndex + 1);
        startHeroTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showHeroSlide(dotIndex);
        startHeroTimer();
      });
    });
  }

  function setupPlayer(shell) {
    const video = shell.querySelector("video");
    const button = shell.querySelector("[data-player-button]");
    const message = shell.querySelector("[data-player-message]");

    if (!video) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function prepareVideo() {
      const source = video.getAttribute("data-src");

      if (!source) {
        setMessage("视频加载失败，请稍后重试");
        return false;
      }

      if (video.dataset.ready === "1") {
        return true;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        setMessage("当前浏览器暂时无法播放此格式");
        return false;
      }

      video.dataset.ready = "1";
      return true;
    }

    function playVideo() {
      setMessage("");

      if (!prepareVideo()) {
        return;
      }

      shell.classList.add("is-playing");
      video.setAttribute("controls", "controls");

      const playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          shell.classList.remove("is-playing");
          setMessage("点击视频区域即可继续播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
      setMessage("");
    });

    video.addEventListener("error", function () {
      setMessage("视频加载失败，请稍后重试");
    });
  }

  document.querySelectorAll("[data-player]").forEach(setupPlayer);

  const searchInput = document.getElementById("movie-search-input");
  const searchRegion = document.getElementById("movie-search-region");
  const searchResults = document.getElementById("movie-search-results");

  function movieCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"poster-card\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\" style=\"background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.78)), url('" + escapeHtml(movie.cover) + "');\">" +
      "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
      "<span class=\"poster-play\">▶</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</p>" +
      "<p class=\"movie-line\">" + escapeHtml(movie.oneLine || "") + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function runSearch() {
    if (!searchResults || !window.MOVIES_INDEX) {
      return;
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const region = searchRegion ? searchRegion.value : "";

    const matched = window.MOVIES_INDEX.filter(function (movie) {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();

      const queryMatch = !query || haystack.indexOf(query) !== -1;
      const regionMatch = !region || movie.regionGroup === region;

      return queryMatch && regionMatch;
    }).slice(0, 80);

    if (!matched.length) {
      searchResults.innerHTML = "<p class=\"movie-meta\">没有找到匹配影片，请尝试更换关键词。</p>";
      return;
    }

    searchResults.innerHTML = matched.map(movieCard).join("");
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", runSearch);
  }

  if (searchRegion && searchResults) {
    searchRegion.addEventListener("change", runSearch);
  }

  runSearch();
})();
