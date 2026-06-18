(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-overlay]');
        var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-start]'));
        var state = player.querySelector('[data-player-state]');
        var source = video ? video.getAttribute('data-stream') : '';
        var loaded = false;
        var hls = null;

        function setState(text) {
            if (state) {
                state.textContent = text;
            }
        }

        function loadSource() {
            if (!video || !source || loaded) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setState('准备播放');
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setState('播放暂时不可用');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setState('准备播放');
            } else {
                setState('播放暂时不可用');
            }
        }

        function startPlayback() {
            loadSource();

            if (!video) {
                return;
            }

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            video.setAttribute('controls', 'controls');
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setState('点击播放');
                });
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', startPlayback);
        });

        if (video) {
            video.addEventListener('play', function () {
                setState('正在播放');
            });

            video.addEventListener('pause', function () {
                setState('已暂停');
            });

            video.addEventListener('ended', function () {
                setState('播放结束');
            });

            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    startPlayback();
                } else {
                    video.pause();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
