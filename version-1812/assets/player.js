let hlsLoader = null;

function loadHls() {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }
    if (hlsLoader) {
        return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve, reject) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.onload = function () {
            resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return hlsLoader;
}

function initMoviePlayer(options) {
    const video = document.querySelector(options.selector);
    const button = document.querySelector(options.button);
    const shell = document.querySelector(options.shell);
    let loaded = false;
    let hls = null;

    if (!video || !button || !shell || !options.source) {
        return;
    }

    async function attachSource() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.source;
            video.load();
            return;
        }

        try {
            const Hls = await loadHls();
            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(options.source);
                hls.attachMedia(video);
                return;
            }
        } catch (error) {
            loaded = true;
        }

        video.src = options.source;
        video.load();
    }

    async function startPlayback() {
        shell.classList.add("is-playing");
        video.controls = true;
        await attachSource();
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    }

    button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
    });

    shell.addEventListener("click", function (event) {
        if (button.contains(event.target)) {
            return;
        }
        if (!loaded || video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        shell.classList.add("is-playing");
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

window.initMoviePlayer = initMoviePlayer;
