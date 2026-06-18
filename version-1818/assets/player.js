document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var trigger = player.querySelector(".play-trigger");
    var stream = player.getAttribute("data-stream");
    var ready = false;
    var hls = null;

    function playVideo() {
      if (!video) {
        return;
      }

      video.controls = true;
      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function attachVideo(callback) {
      if (!video || !stream) {
        return;
      }

      if (ready) {
        callback();
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        ready = true;
        callback();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ maxBufferLength: 30 });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(stream);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          callback();
        });
        window.setTimeout(function () {
          if (!ready) {
            ready = true;
            callback();
          }
        }, 1200);
        return;
      }

      video.src = stream;
      ready = true;
      callback();
    }

    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      attachVideo(playVideo);
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    }
  });
});
