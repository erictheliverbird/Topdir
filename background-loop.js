(function (global) {
    'use strict';

    const FADE_DURATION_MS = 950;
    const LOOP_CHECK_INTERVAL_MS = 100;

    function fadeDurationFor(video) {
        const durationMs = Number.isFinite(video.duration) ? video.duration * 220 : FADE_DURATION_MS;
        return Math.min(FADE_DURATION_MS, Math.max(180, durationMs));
    }

    function hasCrossfadeBuffer(video, durationMs) {
        if (video.readyState < 3) return false;
        if (!video.buffered || video.buffered.length === 0) return true;
        try {
            return video.buffered.end(0) - video.currentTime >= (durationMs / 1000) + 0.1;
        } catch (_) {
            return false;
        }
    }

    function createProjectionBackgroundLoop(primary, secondary, options) {
        if (!primary || !secondary) return { set: function () {}, destroy: function () {} };

        const config = options || {};
        const videos = [primary, secondary];
        const state = {
            assetId: '',
            loadingAsset: '',
            visible: false,
            active: primary,
            standby: secondary,
            fading: false,
            fadeEndsAt: 0,
            lastProgressAt: Date.now(),
            lastTime: null,
            retryAt: 0,
            timer: 0,
            failedAsset: ''
        };

        function prepareElement(video) {
            video.classList.remove('hidden');
            video.classList.add('projection-background-loop-layer');
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.loop = true;
            video.preload = 'auto';
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('loop', '');
            video.setAttribute('autoplay', '');
            video.setAttribute('aria-hidden', 'true');
            video.style.transitionDuration = FADE_DURATION_MS + 'ms';
        }

        function setLayer(video, isVisible, isActive) {
            video.classList.toggle('projection-background-loop-visible', !!isVisible);
            video.classList.toggle('projection-background-loop-active', !!isVisible && !!isActive);
        }

        function reportError(message, error) {
            if (typeof config.onError === 'function') config.onError(message, error);
            if (error) console.warn(message, error);
        }

        function reportReady() {
            if (typeof config.onReady === 'function') config.onReady(state.assetId);
        }

        function stopTimer() {
            if (state.timer) global.clearInterval(state.timer);
            state.timer = 0;
        }

        function setVisibleLayers() {
            videos.forEach(function (video) {
                setLayer(video, state.visible, video === state.active);
            });
        }

        function resetFade() {
            if (!state.fading) return;
            const outgoing = state.active;
            const incoming = state.standby;
            state.active = incoming;
            state.standby = outgoing;
            state.fading = false;
            state.fadeEndsAt = 0;
            outgoing.pause();
            try { outgoing.currentTime = 0; } catch (_) {}
            setVisibleLayers();
        }

        function play(video, assetId) {
            if (!video || !state.visible || document.hidden || state.assetId !== assetId) return;
            if (!video.paused) return;
            Promise.resolve().then(function () { return video.play(); }).then(function () {
                if (state.visible && state.assetId === assetId) setVisibleLayers();
            }).catch(function (error) {
                if (video !== state.active || state.assetId !== assetId) return;
                if (state.failedAsset !== assetId) {
                    state.failedAsset = assetId;
                    videos.forEach(function (layer) {
                        layer.pause();
                        setLayer(layer, false, false);
                    });
                    reportError('No se pudo iniciar el video de fondo; se muestra el fondo estático.', error);
                }
            });
        }

        function startFade() {
            if (state.fading || !state.visible || document.hidden) return;
            const outgoing = state.active;
            const incoming = state.standby;
            if (!Number.isFinite(outgoing.duration) || outgoing.duration <= 0) return;
            const durationMs = fadeDurationFor(outgoing);
            if (!hasCrossfadeBuffer(incoming, durationMs)) return;
            try {
                if (incoming.currentTime > 0.08 || incoming.ended) incoming.currentTime = 0;
            } catch (_) { return; }
            incoming.muted = true;
            incoming.defaultMuted = true;
            incoming.playsInline = true;
            Promise.resolve().then(function () { return incoming.play(); }).then(function () {
                if (!state.visible || document.hidden || state.assetId !== incoming.dataset.projectionBackgroundAsset) {
                    incoming.pause();
                    return;
                }
                state.fading = true;
                state.fadeEndsAt = Date.now() + durationMs + 80;
                incoming.style.transitionDuration = durationMs + 'ms';
                outgoing.style.transitionDuration = durationMs + 'ms';
                setLayer(incoming, true, true);
                setLayer(outgoing, true, false);
            }).catch(function () {
                // El video actual conserva loop nativo como respaldo si Safari no permite
                // iniciar el segundo elemento para el fundido.
                state.retryAt = Date.now() + 1500;
            });
        }

        function tick() {
            if (!state.visible || document.hidden || state.loadingAsset || !state.assetId || state.failedAsset === state.assetId) return;
            const now = Date.now();
            if (state.fading) {
                if (now >= state.fadeEndsAt) resetFade();
                return;
            }

            const active = state.active;
            const standby = state.standby;
            if (active.readyState < 2 || active.dataset.projectionBackgroundAsset !== state.assetId) return;

            const currentTime = Number(active.currentTime) || 0;
            if (state.lastTime === null || currentTime > state.lastTime + 0.02 || currentTime < state.lastTime - 0.1) {
                state.lastTime = currentTime;
                state.lastProgressAt = now;
            } else if (!active.paused && !active.seeking && active.readyState >= 3 && now - state.lastProgressAt > 5000) {
                active.pause();
                state.lastProgressAt = now;
                state.retryAt = now + 350;
                return;
            }

            if (active.paused) {
                if (now >= state.retryAt) {
                    state.retryAt = now + 2000;
                    play(active, state.assetId);
                }
                return;
            }

            if (now < state.retryAt || !Number.isFinite(active.duration) || active.duration <= 0) return;
            const remaining = active.duration - currentTime;
            if (remaining <= (fadeDurationFor(active) / 1000) + 0.08 && hasCrossfadeBuffer(standby, fadeDurationFor(active))) startFade();
        }

        function loadAsset(assetId) {
            state.loadingAsset = assetId;
            state.failedAsset = '';
            state.active = primary;
            state.standby = secondary;
            state.fading = false;
            state.lastTime = null;
            state.retryAt = 0;
            videos.forEach(function (video) {
                video.pause();
                setLayer(video, state.visible, video === state.active);
                video.dataset.projectionBackgroundAsset = '';
            });

            Promise.resolve().then(function () {
                if (typeof config.getUrl !== 'function') throw new Error('No hay un cargador para el archivo de fondo.');
                return config.getUrl(assetId);
            }).then(function (url) {
                if (state.assetId !== assetId) return;
                if (!state.visible) { state.loadingAsset = ''; return; }
                if (!url) throw new Error('No se encontró el archivo de fondo guardado.');
                videos.forEach(function (video) {
                    video.src = url;
                    video.dataset.projectionBackgroundAsset = assetId;
                    video.load();
                });
                const active = state.active;
                const startWhenReady = function () {
                    if (state.assetId !== assetId || !state.visible) return;
                    if (active.readyState >= 2) {
                        state.loadingAsset = '';
                        state.lastProgressAt = Date.now();
                        reportReady();
                        play(active, assetId);
                    }
                };
                active.addEventListener('loadeddata', startWhenReady);
                active.addEventListener('canplay', startWhenReady);
                active.addEventListener('error', function () {
                    if (state.assetId !== assetId || active !== state.active) return;
                    state.loadingAsset = '';
                    state.failedAsset = assetId;
                    setLayer(primary, false, false);
                    setLayer(secondary, false, false);
                    reportError('No se pudo cargar el video de fondo; se muestra el fondo estático.');
                }, { once: true });
                startWhenReady();
                // El segundo reproductor puede tardar en preparar sus fotogramas. La capa
                // actual empieza sin esperar; el fundido se habilita cuando el segundo esté listo.
                standby.addEventListener('canplay', function () {}, { once: true });
            }).catch(function (error) {
                if (state.assetId !== assetId) return;
                state.loadingAsset = '';
                state.failedAsset = assetId;
                setLayer(primary, false, false);
                setLayer(secondary, false, false);
                reportError('El video de fondo no está disponible en este dispositivo; se muestra el fondo estático.', error);
            });
        }

        function set(assetId, visible) {
            const wasVisible = state.visible;
            const id = visible ? String(assetId || '') : state.assetId || String(assetId || '');
            state.visible = !!visible && !!id;
            if (!state.visible) {
                resetFade();
                videos.forEach(function (video) {
                    video.pause();
                    setLayer(video, false, video === state.active);
                });
                return;
            }

            videos.forEach(prepareElement);
            setVisibleLayers();
            if (!wasVisible && state.failedAsset === id) {
                state.failedAsset = '';
                state.assetId = '';
            }
            if (state.assetId !== id) {
                state.assetId = id;
                loadAsset(id);
            } else if (state.failedAsset === id) {
                return;
            } else if (!state.loadingAsset) {
                play(state.active, id);
            }
            if (!state.timer) state.timer = global.setInterval(tick, LOOP_CHECK_INTERVAL_MS);
        }

        function resume() {
            if (!state.visible || document.hidden || !state.assetId || state.failedAsset === state.assetId) return;
            play(state.active, state.assetId);
        }

        function destroy() {
            stopTimer();
            videos.forEach(function (video) {
                video.pause();
                video.removeAttribute('src');
                video.load();
                video.classList.remove('projection-background-loop-visible', 'projection-background-loop-active', 'projection-background-loop-layer');
            });
            global.removeEventListener('pageshow', resume);
            document.removeEventListener('visibilitychange', resume);
        }

        videos.forEach(prepareElement);
        global.addEventListener('pageshow', resume);
        document.addEventListener('visibilitychange', resume);
        return { set: set, destroy: destroy };
    }

    global.ProjectionBackgroundLoop = { create: createProjectionBackgroundLoop };
})(window);
