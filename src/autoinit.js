// autoinit.js (unified controller map + instance state)

import {TimelineAnimator} from './animbase-core.js';

const controllers = new Map();

let AB = {};

// --- Public Control API ---
['trigger', 'pause', 'resume', 'stop', 'seek', 'setOnce', 'setReverse', 'setHooks'].forEach(fn => {
	AB[fn] = function (group = 'default', value) {
		const animator = controllers.get(group);
		if (!animator || !animator.state) return;
		const state = animator.state;
		switch (fn) {
			case 'trigger':
				const options = value || {};
				if (!state.running) {
					state.running = true;
					if (typeof options.onStart === 'function') state.onStart = options.onStart;
					if (typeof options.onFinish === 'function') state.onFinish = options.onFinish;

					state.reverse = options.reverse ?? state.reverse;
					state.once = options.once ?? state.once;
					state.max = options.max ?? state.max;

					state.from = typeof options.from === 'number' ? options.from : state.reverse ? state.max : 0;
					state.to = typeof options.to === 'number' ? options.to : state.reverse ? 0 : state.max;
					state.frame = state.from;

					const speed =
						options.speed || (state.duration ? (1000 * Math.abs(state.to - state.from)) / state.duration : 60);
					state.duration = (1000 / speed) * Math.abs(state.to - state.from);

					state.startTime = performance.now();
					runLoop(animator);
				}
				break;
			case 'pause':
				state.running = false;
				state.pauseTime = performance.now();
				break;
			case 'resume':
				const pauseDuration = performance.now() - state.pauseTime;
				state.startTime += pauseDuration;
				state.running = true;
				runLoop(animator);
				break;

			case 'stop':
				state.running = false;
				state.frame = state.reverse ? state.max : 0;
				animator.updateTimeline();
				break;
			case 'seek':
				state.frame = Math.max(0, Math.min(state.max, value || 0));
				animator.updateTimeline();
				break;
			case 'setOnce':
				state.once = !!value;
				break;
			case 'setReverse':
				state.reverse = !!value;
				break;
			case 'setHooks':
				const {onStart, onFinish} = value || {};
				if (onStart) state.onStart = onStart;
				if (onFinish) state.onFinish = onFinish;
				break;
		}
	};
});

function createTimedAnimator(group, config = {}) {
	let {configSelector, elementSelector, ...cfg} = config;
	if (configSelector) {
		const configEl = document.querySelector(configSelector);
		if (configEl?.dataset?.animTriggerConfig) cfg = JSON.parse(configEl.dataset.animTriggerConfig);
	}

	const max = cfg.max || 100;
	const speed = parseFloat(cfg.speed) || 60;
	const duration = (1000 / speed) * max;
	const autostart = cfg.autostart || false;

	let animator;
	animator = new TimelineAnimator(
		() => animator?.state?.frame ?? (cfg.reverse ? max : 0),
		elementSelector ? {elementSelector} : {autoCollect: false, autoUpdate: false}
	);

	animator.state = {
		frame: 0,
		max,
		duration,
		running: false,
		startTime: 0,
		pauseTime: 0,
		once: cfg.once || false,
		reverse: cfg.reverse || false,
		onStart: cfg.onStart || null,
		onFinish: cfg.onFinish || null,
		from: null,
		to: null,
	};

	controllers.set(group, animator);
	if (autostart) {
		AB.trigger(group);
	}
	return animator;
}

function runLoop(animator) {
	const state = animator.state;
	const loop = () => {
		const now = performance.now();
		const elapsed = now - state.startTime;
		let t = elapsed / state.duration;

		t = Math.max(0, Math.min(1, t));
		const delta = (state.to ?? state.max) - (state.from ?? 0);
		state.frame = Math.floor((state.from ?? 0) + delta * t);
		animator.updateTimeline();

		if (t >= 1) {
			if (state.once) {
				state.running = false;
				if (state.onFinish) state.onFinish();
				return;
			} else {
				state.startTime = performance.now();
				if (state.onFinish) state.onFinish();
			}
		}
		if (state.running) requestAnimationFrame(loop);
	};
	loop();
}

const defaultListeners = {
	scrollY: 'scroll',
	scrollX: 'scroll',
	scrollTop: 'scroll',
	scrollLeft: 'scroll',
	value: 'input',
	currentTime: 'timeupdate',
};

const ATTR_CONTROLLER_REF = 'data-anim-controller-ref';
const ATTR_CONTROLLED_BY = 'data-anim-controlled-by';
const ATTR_GROUP = 'data-anim-trigger-group';
const ATTR_CONFIG = 'data-anim-trigger-config';
const ATTR_INIT = 'data-anim-init';

function scanAnimatedElements() {
	const animatedElements = document.querySelectorAll(
		`[${ATTR_CONTROLLER_REF}], [${ATTR_CONTROLLED_BY}], [${ATTR_GROUP}], [${ATTR_INIT}]`
	);

	animatedElements.forEach(el => {
		let refSelector = el.dataset.animControllerRef;
		let controlProp = el.dataset.animControlledBy;
		if (['scrollTop', 'scrollY', 'scrollLeft', 'scrollX'].includes(controlProp)) {
			if (!refSelector) refSelector = 'window';
			el.setAttribute(ATTR_CONTROLLER_REF, refSelector);
			if (refSelector === 'window') {
				if (controlProp === 'scrollLeft') el.setAttribute(ATTR_CONTROLLED_BY, 'scrollX');
				if (controlProp === 'scrollTop') el.setAttribute(ATTR_CONTROLLED_BY, 'scrollY');
			} else {
				if (controlProp === 'scrollX') el.setAttribute(ATTR_CONTROLLED_BY, 'scrollLeft');
				if (controlProp === 'scrollY') el.setAttribute(ATTR_CONTROLLED_BY, 'scrollTop');
			}
		} else if (!!refSelector && refSelector !== 'window' && !controlProp) {
			el.setAttribute(ATTR_CONTROLLED_BY, 'value');
		} else if (!refSelector && !el.dataset.animTriggerGroup) {
			el.setAttribute(ATTR_GROUP, 'default');
		}
	});

	animatedElements.forEach(el => {
		const refSelector = el.dataset.animControllerRef;
		const controlProp = el.dataset.animControlledBy;
		const customListen = el.dataset.animListen;

		// Unified controlled-by external source
		if (refSelector || controlProp) {
			const refEl = refSelector && refSelector !== 'window' ? document.querySelector(refSelector) : window;
			if (!refEl) return console.warn('Missing controller:', refSelector);

			const key = `${refSelector || 'window'}:${controlProp || 'value'}`;
			if (!controllers.has(key)) {
				const getter = () => parseFloat(refEl[controlProp || 'value'] || 0);
				const animator = new TimelineAnimator(getter, {
					elementSelector: `[${ATTR_CONTROLLER_REF}="${
						refSelector || ''
					}"][${ATTR_CONTROLLED_BY}="${controlProp}"]`,
				});
				controllers.set(key, animator);
				const eventName = customListen || defaultListeners[controlProp || 'value'] || 'input';
				refEl.addEventListener(eventName, () => animator.updateTimeline());
			}
			return;
		}

		// Triggered loop animation (timed)
		if (el.dataset.animTriggerGroup) {
			const group = el.dataset.animTriggerGroup;
			if (!controllers.has(group)) {
				createTimedAnimator(group, {
					configSelector: `[${ATTR_GROUP}="${group}"][${ATTR_CONFIG}]`,
					elementSelector: `[${ATTR_GROUP}="${group}"]:not([${ATTR_CONFIG}])`,
				});
			}
			return;
		}
	});
}

// alias
AB.play = AB.trigger;
AB.setProgress = AB.seek;

AB.refresh = scanAnimatedElements;
AB.getAnimator = key => controllers.get(key);

AB.createTimedAnimator = createTimedAnimator;

document.addEventListener('DOMContentLoaded', scanAnimatedElements);

export default AB;
