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
            preparingFade: false,
            fadePreparationId: 0,
            fadeEndsAt: 0,
            lastProgressAt: Date.now(),
            lastTime: null,
            retryAt: 0,
            timer: 0,
            failedAsset: '',
            lastPlayErrorAt: 0,
            lastSyncAt: 0
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
            if (!video || !state.visible || state.assetId !== assetId || video._projectionBackgroundPlayPending) return;
            if (!video.paused) return;
            video._projectionBackgroundPlayPending = true;
            Promise.resolve().then(function () { return video.play(); }).then(function () {
                if (state.visible && state.assetId === assetId) {
                    state.failedAsset = '';
                    state.retryAt = 0;
                    state.lastProgressAt = Date.now();
                    setVisibleLayers();
                }
            }).catch(function (error) {
                if (video !== state.active || state.assetId !== assetId) return;
                state.retryAt = Date.now() + 700;
                if (Date.now() - state.lastPlayErrorAt > 5000) {
                    state.lastPlayErrorAt = Date.now();
                    reportError('Safari pausó el fondo; se reintentará automáticamente.', error);
                }
            }).finally(function () { video._projectionBackgroundPlayPending = false; });
        }

        function waitForVideoFrame(video, timeoutMs) {
            return new Promise(function (resolve) {
                let settled = false;
                let timeout = 0;
                let frameCallbackId = 0;
                const finish = function (ready) {
                    if (settled) return;
                    settled = true;
                    if (timeout) global.clearTimeout(timeout);
                    if (video && frameCallbackId && typeof video.cancelVideoFrameCallback === 'function') {
                        try { video.cancelVideoFrameCallback(frameCallbackId); } catch (_) {}
                    }
                    video.removeEventListener('loadeddata', checkReady);
                    resolve(!!ready);
                };
                const checkReady = function () {
                    if (!video || video.readyState < 2 || !video.videoWidth) return;
                    if (typeof video.requestVideoFrameCallback === 'function') {
                        try {
                            frameCallbackId = video.requestVideoFrameCallback(function () { finish(true); });
                            return;
                        } catch (_) {}
                    }
                    global.requestAnimationFrame(function () {
                        global.requestAnimationFrame(function () {
                            finish(video.readyState >= 2 && video.videoWidth > 0);
                        });
                    });
                };
                timeout = global.setTimeout(function () { finish(false); }, timeoutMs || 700);
                video.addEventListener('loadeddata', checkReady);
                checkReady();
            });
        }

        function startFade() {
            if (state.fading || state.preparingFade || !state.visible) return;
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
            state.preparingFade = true;
            const preparationId = ++state.fadePreparationId;
            Promise.resolve().then(function () { return incoming.play(); }).then(async function () {
                const hasDecodedFrame = await waitForVideoFrame(incoming, 700);
                if (preparationId !== state.fadePreparationId) {
                    incoming.pause();
                    return;
                }
                state.preparingFade = false;
                if (!state.visible || state.assetId !== incoming.dataset.projectionBackgroundAsset) {
                    incoming.pause();
                    return;
                }
                if (!hasDecodedFrame) {
                    incoming.pause();
                    state.retryAt = Date.now() + 800;
                    return;
                }
                state.fading = true;
                state.fadeEndsAt = Date.now() + durationMs + 80;
                incoming.style.transitionDuration = durationMs + 'ms';
                outgoing.style.transitionDuration = durationMs + 'ms';
                setLayer(incoming, true, true);
                setLayer(outgoing, true, false);
            }).catch(function () {
                if (preparationId === state.fadePreparationId) state.preparingFade = false;
                // El video actual conserva loop nativo como respaldo si Safari no permite
                // iniciar el segundo elemento para el fundido.
                if (preparationId === state.fadePreparationId) state.retryAt = Date.now() + 1500;
            });
        }

        function tick() {
            if (!state.visible || state.loadingAsset || !state.assetId || state.failedAsset === state.assetId) return;
            const now = Date.now();
            if (state.fading) {
                if (now >= state.fadeEndsAt) resetFade();
                return;
            }

            const active = state.active;
            const standby = state.standby;
            if (active.dataset.projectionBackgroundAsset !== state.assetId) return;

            const currentTime = Number(active.currentTime) || 0;
            if (state.lastTime === null || currentTime > state.lastTime + 0.02 || currentTime < state.lastTime - 0.1) {
                state.lastTime = currentTime;
                state.lastProgressAt = now;
            } else if (!active.paused && !active.seeking && now - state.lastProgressAt > 2200) {
                const remaining = Number.isFinite(active.duration) ? active.duration - currentTime : Infinity;
                if (remaining <= 2.2 && hasCrossfadeBuffer(standby, fadeDurationFor(active))) {
                    startFade();
                    return;
                }
                active.pause();
                state.lastProgressAt = now;
                state.retryAt = now + 250;
                if (Number.isFinite(active.duration) && active.duration > 0 && active.duration - currentTime <= 0.4) {
                    try { active.currentTime = 0; } catch (_) {}
                }
                return;
            }

            if (active.paused) {
                if (now >= state.retryAt) {
                    state.retryAt = now + 2000;
                    play(active, state.assetId);
                }
                return;
            }

            if (active.readyState < 2 || now < state.retryAt || !Number.isFinite(active.duration) || active.duration <= 0) return;
            const remaining = active.duration - currentTime;
            if (remaining <= (fadeDurationFor(active) / 1000) + 0.8 && hasCrossfadeBuffer(standby, fadeDurationFor(active))) startFade();

            if (typeof config.onTime === 'function' && now - state.lastSyncAt >= 1200) {
                state.lastSyncAt = now;
                config.onTime(state.assetId, currentTime);
            }
        }

        function loadAsset(assetId) {
            state.fadePreparationId++;
            state.preparingFade = false;
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
                const standby = state.standby;
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
                const primeStandby = function () {
                    if (state.assetId !== assetId || !state.visible || standby._projectionBackgroundPriming || standby.readyState >= 3) return;
                    standby._projectionBackgroundPriming = true;
                    standby.muted = true;
                    standby.play().then(function () {
                        global.setTimeout(function () {
                            standby.pause();
                            try { standby.currentTime = 0; } catch (_) {}
                            standby._projectionBackgroundPriming = false;
                        }, 300);
                    }).catch(function () { standby._projectionBackgroundPriming = false; });
                };
                standby.addEventListener('loadeddata', primeStandby, { once: true });
                standby.addEventListener('canplay', primeStandby, { once: true });
                startWhenReady();
                // Se decodifica brevemente la copia inactiva desde el comienzo para que
                // Safari tenga fotogramas y búfer preparados antes del cambio de ciclo.
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
                state.fadePreparationId++;
                state.preparingFade = false;
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
                if (state.active.paused) play(state.active, id);
                else if (Date.now() - state.lastProgressAt > 1800) {
                    state.active.pause();
                    state.retryAt = Date.now() + 200;
                }
            }
            if (!state.timer) state.timer = global.setInterval(tick, LOOP_CHECK_INTERVAL_MS);
        }

        function resume() {
            if (!state.visible || !state.assetId || state.failedAsset === state.assetId) return;
            play(state.active, state.assetId);
        }

        function sync(time) {
            const target = Number(time);
            const active = state.active;
            if (!state.visible || !Number.isFinite(target) || active.readyState < 1 || !Number.isFinite(active.duration) || active.duration <= 0) return;
            if (Math.abs(active.currentTime - target) > 1.25 && !state.fading) {
                try { active.currentTime = Math.max(0, Math.min(target, active.duration - 0.05)); } catch (_) {}
            }
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
        videos.forEach(function (video) {
            ['pause', 'waiting', 'stalled', 'ended'].forEach(function (eventName) {
                video.addEventListener(eventName, function () {
                    if (!state.visible || state.loadingAsset || video !== state.active || !state.assetId) return;
                    if (eventName === 'ended' && Number.isFinite(video.duration) && video.duration > 0) {
                        const standby = state.standby;
                        if (hasCrossfadeBuffer(standby, fadeDurationFor(video))) { startFade(); return; }
                        try { video.currentTime = 0; } catch (_) {}
                    }
                    state.retryAt = Math.min(state.retryAt || Date.now() + 200, Date.now() + 200);
                    global.setTimeout(function () {
                        if (!state.visible || video !== state.active || !state.assetId || state.fading) return;
                        if (video.paused) play(video, state.assetId);
                    }, 220);
                });
            });
        });
        global.addEventListener('pageshow', resume);
        document.addEventListener('visibilitychange', resume);
        return { set: set, sync: sync, destroy: destroy };
    }

    global.ProjectionBackgroundLoop = { create: createProjectionBackgroundLoop };
})(window);
