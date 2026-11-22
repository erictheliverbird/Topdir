(function (global) {
    'use strict';

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const instances = new WeakMap();
    let nextMaskId = 0;

    function contentKey(data) {
        if (!data || typeof data !== 'object') return '';
        if (data.isBlackout) return 'blackout';

        const mediaMode = String(data.mediaMode || 'none');
        if (mediaMode === 'screen') return 'media:screen';
        if (mediaMode === 'video' || mediaMode === 'youtube') {
            return JSON.stringify(['media', mediaMode, String(data.videoUrl || '')]);
        }

        const styles = data.styles || {};
        if (data.isStandby) return JSON.stringify(['standby', String(styles.logoUrl || '')]);
        if (data.isClearText) return 'clear';

        const karaoke = data.karaoke || {};
        const stanza = String(karaoke.stanza || '');
        if (karaoke.active && stanza.trim()) return JSON.stringify(['karaoke', stanza]);
        return JSON.stringify(['verse', String(data.citation || ''), String(data.text || '')]);
    }

    function svgElement(document, name, attributes) {
        const element = document.createElementNS(SVG_NS, name);
        Object.keys(attributes || {}).forEach(key => element.setAttribute(key, String(attributes[key])));
        return element;
    }

    function createLayer(container) {
        const document = container.ownerDocument || global.document;
        const view = document.defaultView || global;
        const maskId = 'projection-water-mask-' + (++nextMaskId);
        const layer = document.createElement('div');
        layer.className = 'projection-water-ripple-layer';
        layer.setAttribute('aria-hidden', 'true');

        const svg = svgElement(document, 'svg', {
            'class': 'projection-water-ripple-svg',
            'width': '100%',
            'height': '100%',
            'preserveAspectRatio': 'none',
            'aria-hidden': 'true',
            'focusable': 'false'
        });
        svg.style.cssText = 'display:block;width:100%;height:100%;';

        const defs = svgElement(document, 'defs');
        const mask = svgElement(document, 'mask', {
            'id': maskId,
            'maskUnits': 'userSpaceOnUse',
            'maskContentUnits': 'userSpaceOnUse',
            'mask-type': 'luminance'
        });
        const maskSurface = svgElement(document, 'rect', { x: 0, y: 0, width: 1, height: 1, fill: '#fff' });
        const maskReveal = svgElement(document, 'circle', { cx: 0, cy: 0, r: 0, fill: '#000' });
        mask.append(maskSurface, maskReveal);

        const surfaceGradient = svgElement(document, 'linearGradient', { id: maskId + '-surface', x1: 0, y1: 0, x2: 0, y2: 1 });
        surfaceGradient.append(
            svgElement(document, 'stop', { offset: '0%', 'stop-color': '#10171d' }),
            svgElement(document, 'stop', { offset: '45%', 'stop-color': '#070b10' }),
            svgElement(document, 'stop', { offset: '100%', 'stop-color': '#020407' })
        );
        const silverGradient = svgElement(document, 'linearGradient', { id: maskId + '-silver', x1: 0, y1: 0, x2: 1, y2: 1 });
        silverGradient.append(
            svgElement(document, 'stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': '.10' }),
            svgElement(document, 'stop', { offset: '34%', 'stop-color': '#fff', 'stop-opacity': '.78' }),
            svgElement(document, 'stop', { offset: '58%', 'stop-color': '#dce7ed', 'stop-opacity': '.22' }),
            svgElement(document, 'stop', { offset: '100%', 'stop-color': '#fff', 'stop-opacity': '.66' })
        );
        const dropGradient = svgElement(document, 'linearGradient', { id: maskId + '-drop', x1: 0, y1: 0, x2: 1, y2: 1 });
        dropGradient.append(
            svgElement(document, 'stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': '.96' }),
            svgElement(document, 'stop', { offset: '55%', 'stop-color': '#d7e1e7', 'stop-opacity': '.86' }),
            svgElement(document, 'stop', { offset: '100%', 'stop-color': '#87939b', 'stop-opacity': '.4' })
        );
        const impactGradient = svgElement(document, 'radialGradient', { id: maskId + '-impact' });
        impactGradient.append(
            svgElement(document, 'stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': '.52' }),
            svgElement(document, 'stop', { offset: '35%', 'stop-color': '#dbe5ea', 'stop-opacity': '.22' }),
            svgElement(document, 'stop', { offset: '100%', 'stop-color': '#dbe5ea', 'stop-opacity': '0' })
        );
        defs.append(mask, surfaceGradient, silverGradient, dropGradient, impactGradient);

        const surface = svgElement(document, 'g', { mask: 'url(#' + maskId + ')' });
        const surfaceRect = svgElement(document, 'rect', { x: 0, y: 0, width: 1, height: 1, fill: 'url(#' + maskId + '-surface)' });
        const reflectionPaths = [
            svgElement(document, 'path', { fill: 'none', stroke: '#e5edf1', 'stroke-width': 1.1, 'stroke-opacity': '.10' }),
            svgElement(document, 'path', { fill: 'none', stroke: '#e5edf1', 'stroke-width': .8, 'stroke-opacity': '.07' }),
            svgElement(document, 'path', { fill: 'none', stroke: '#e5edf1', 'stroke-width': .6, 'stroke-opacity': '.06' })
        ];
        surface.append(surfaceRect, ...reflectionPaths);

        const waves = svgElement(document, 'g');
        const rings = [];
        for (let index = 0; index < 3; index++) {
            const ring = svgElement(document, 'circle', {
                cx: 0,
                cy: 0,
                r: 0,
                fill: 'none',
                stroke: 'url(#' + maskId + '-silver)',
                'stroke-width': 1,
                'stroke-linecap': 'round',
                opacity: 0
            });
            const echo = svgElement(document, 'circle', {
                cx: 0,
                cy: 0,
                r: 0,
                fill: 'none',
                stroke: '#fff',
                'stroke-width': .6,
                'stroke-opacity': '.34',
                opacity: 0
            });
            waves.append(ring, echo);
            rings.push({ ring, echo, offset: index * .055 });
        }

        const impact = svgElement(document, 'circle', { cx: 0, cy: 0, r: 0, fill: 'url(#' + maskId + '-impact)', opacity: 0 });
        const drop = svgElement(document, 'path', {
            d: 'M0,-18 C-5,-10 -13,0 -13,9 A13,13 0 1 0 13,9 C13,0 5,-10 0,-18 Z',
            fill: 'url(#' + maskId + '-drop)',
            stroke: '#fff',
            'stroke-opacity': '.42',
            'stroke-width': '.8',
            opacity: 0
        });

        svg.append(defs, surface, waves, impact, drop);
        layer.appendChild(svg);
        container.appendChild(layer);

        return {
            layer,
            svg,
            view,
            mask,
            maskSurface,
            maskReveal,
            surfaceRect,
            reflectionPaths,
            rings,
            impact,
            drop,
            frameId: 0,
            width: 0,
            height: 0
        };
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function easeOutCubic(value) {
        const remainder = 1 - value;
        return 1 - remainder * remainder * remainder;
    }

    function setAttribute(element, name, value) {
        element.setAttribute(name, String(Math.round(value * 100) / 100));
    }

    function drawFrame(state, progress) {
        const width = state.width;
        const height = state.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const shortestSide = Math.min(width, height);
        const coverRadius = Math.hypot(width / 2, height / 2) * 1.06;
        const revealStart = .27;
        const revealProgress = clamp((progress - revealStart) / .68, 0, 1);
        setAttribute(state.maskReveal, 'cx', centerX);
        setAttribute(state.maskReveal, 'cy', centerY);
        setAttribute(state.maskReveal, 'r', coverRadius * easeOutCubic(revealProgress));

        const dropStart = .045;
        const impactAt = .24;
        const dropProgress = clamp((progress - dropStart) / (impactAt - dropStart), 0, 1);
        const dropY = height * (.13 + .37 * easeOutCubic(dropProgress));
        const dropFade = progress < .215 ? 1 : clamp((impactAt - progress) / .035, 0, 1);
        state.drop.setAttribute('transform', 'translate(' + centerX.toFixed(2) + ' ' + dropY.toFixed(2) + ') scale(' + (0.78 + .22 * dropProgress).toFixed(3) + ')');
        setAttribute(state.drop, 'opacity', dropFade);

        const impactProgress = clamp((progress - .255) / .13, 0, 1);
        const impactOpacity = Math.sin(Math.PI * impactProgress) * .34;
        setAttribute(state.impact, 'cx', centerX);
        setAttribute(state.impact, 'cy', centerY);
        setAttribute(state.impact, 'r', shortestSide * (.018 + .13 * impactProgress));
        setAttribute(state.impact, 'opacity', impactOpacity);

        const ringMaxRadius = coverRadius * .92;
        const ringStrokeWidth = clamp(shortestSide / 520, .8, 2.4);
        state.rings.forEach((item, index) => {
            const start = .28 + item.offset;
            const localProgress = clamp((progress - start) / (.92 - start), 0, 1);
            const radius = shortestSide * .012 + ringMaxRadius * easeOutCubic(localProgress);
            const opacity = Math.sin(Math.PI * localProgress) * (.46 - index * .055);
            [item.ring, item.echo].forEach(ring => {
                setAttribute(ring, 'cx', centerX);
                setAttribute(ring, 'cy', centerY);
                setAttribute(ring, 'r', radius);
                setAttribute(ring, 'opacity', opacity);
            });
            setAttribute(item.ring, 'stroke-width', ringStrokeWidth);
        });
    }

    function stop(state) {
        if (!state) return;
        if (state.frameId) state.view.cancelAnimationFrame(state.frameId);
        state.frameId = 0;
        state.layer.classList.remove('is-active');
    }

    function play(container, durationMs) {
        if (!container || !container.ownerDocument) return false;
        let state = instances.get(container);
        if (!state) {
            state = createLayer(container);
            instances.set(container, state);
        }
        stop(state);

        const width = Math.max(1, container.clientWidth || container.getBoundingClientRect().width || 1);
        const height = Math.max(1, container.clientHeight || container.getBoundingClientRect().height || 1);
        state.width = width;
        state.height = height;
        state.svg.setAttribute('viewBox', '0 0 ' + width.toFixed(2) + ' ' + height.toFixed(2));
        state.mask.setAttribute('x', '0');
        state.mask.setAttribute('y', '0');
        state.mask.setAttribute('width', String(width));
        state.mask.setAttribute('height', String(height));
        state.maskSurface.setAttribute('width', String(width));
        state.maskSurface.setAttribute('height', String(height));
        state.surfaceRect.setAttribute('width', String(width));
        state.surfaceRect.setAttribute('height', String(height));
        const pathData = [
            'M0 ' + (height * .31).toFixed(1) + ' C' + (width * .22).toFixed(1) + ' ' + (height * .27).toFixed(1) + ' ' + (width * .71).toFixed(1) + ' ' + (height * .35).toFixed(1) + ' ' + width.toFixed(1) + ' ' + (height * .3).toFixed(1),
            'M0 ' + (height * .39).toFixed(1) + ' C' + (width * .3).toFixed(1) + ' ' + (height * .42).toFixed(1) + ' ' + (width * .64).toFixed(1) + ' ' + (height * .35).toFixed(1) + ' ' + width.toFixed(1) + ' ' + (height * .4).toFixed(1),
            'M0 ' + (height * .65).toFixed(1) + ' C' + (width * .27).toFixed(1) + ' ' + (height * .61).toFixed(1) + ' ' + (width * .69).toFixed(1) + ' ' + (height * .68).toFixed(1) + ' ' + width.toFixed(1) + ' ' + (height * .63).toFixed(1)
        ];
        state.reflectionPaths.forEach((path, index) => path.setAttribute('d', pathData[index]));

        state.layer.classList.add('is-active');
        const duration = clamp(Number(durationMs) || 2000, 300, 6000);
        let startedAt = 0;
        const frame = timestamp => {
            if (!startedAt) startedAt = timestamp;
            const progress = clamp((timestamp - startedAt) / duration, 0, 1);
            drawFrame(state, progress);
            if (progress >= 1) {
                stop(state);
                return;
            }
            state.frameId = state.view.requestAnimationFrame(frame);
        };
        state.frameId = state.view.requestAnimationFrame(frame);
        return true;
    }

    function isHidden(container) {
        if (container.classList && container.classList.contains('hidden')) return true;
        return !!(container.closest && container.closest('.hidden,[hidden]'));
    }

    function sync(container, data, allowAnimation = true) {
        if (!container || !data) return false;
        const key = contentKey(data);
        const previousKey = container.dataset.projectionWaterRippleContentKey;
        container.dataset.projectionWaterRippleContentKey = key;
        if (previousKey === undefined || previousKey === key || !allowAnimation || isHidden(container)) return false;
        if (String(data.styles && data.styles.mediaTransition || '') !== 'water-ripple') return false;

        const view = container.ownerDocument && container.ownerDocument.defaultView || global;
        const duration = Number(data.styles && data.styles.mediaTransitionDurationMs) || 2000;
        const reduceMotion = data.styles && data.styles.respectReducedMotion === true &&
            view.matchMedia && view.matchMedia('(prefers-reduced-motion: reduce)').matches;
        return play(container, reduceMotion ? Math.min(400, duration) : duration);
    }

    global.ProjectionWaterRipple = {
        contentKey,
        play,
        sync
    };
})(window);
