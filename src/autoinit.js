// autoinit.js (refactored with 3 controller types)

import { TimelineAnimator } from "./animbase-core.js";

const loopStateMap = new Map();
const controllers = new Map();

window.AnimBase = window.AnimBase || {};

function getKey(type, groupOrId = "") {
	return type === "timed" ? `timed::${groupOrId}` : groupOrId;
}

// --- Public Control API ---
[
	"trigger",
	"pause",
	"resume",
	"stop",
	"seek",
	"setOnce",
	"setReverse",
	"setHooks",
].forEach((fn) => {
	window.AnimBase[fn] = function (group) {
		const key = getKey("timed", group);
		const state = loopStateMap.get(key);
		if (!state) return;
		switch (fn) {
			case "trigger":
				if (!state.running) {
					state.running = true;
					if (state.onStart) state.onStart();
					state.startTime = performance.now();
					runLoop(state);
				}
				break;
			case "pause":
				state.running = false;
				state.pauseTime = performance.now();
				break;
			case "resume":
				const pauseDuration = performance.now() - state.pauseTime;
				state.startTime += pauseDuration;
				state.running = true;
				runLoop(state);
				break;
			case "stop":
				state.running = false;
				state.frame = state.reverse ? state.max : 0;
				state.animator.updateTimeline();
				break;
			case "seek":
				state.frame = Math.max(
					0,
					Math.min(state.max, arguments[1] || 0)
				);
				state.animator.updateTimeline();
				break;
			case "setOnce":
				state.once = !!arguments[1];
				break;
			case "setReverse":
				state.reverse = !!arguments[1];
				break;
			case "setHooks":
				const { onStart, onFinish } = arguments[1] || {};
				if (onStart) state.onStart = onStart;
				if (onFinish) state.onFinish = onFinish;
				break;
		}
	};
});

function runLoop(state) {
	const loop = () => {
		const now = performance.now();
		const elapsed = now - state.startTime;
		let t = elapsed / state.duration;

		t = Math.max(0, Math.min(1, t));

		const progress = state.reverse ? 1 - t : t;
		state.frame = Math.floor(progress * state.max);
		state.animator.updateTimeline();

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

function scanAnimatedElements() {
	const animatedElements = document.querySelectorAll(
		"[data-anim-controller-ref], [data-anim-controlled-by], [data-anim-trigger-group]"
	);

	animatedElements.forEach((el) => {
		// 1. Controlled by another element (range, etc)
		if (el.dataset.animControllerRef) {
			const refSelector = el.dataset.animControllerRef;
			const refEl = document.querySelector(refSelector);
			if (!refEl) return console.warn("Missing controller:", refSelector);
			if (!controllers.has(refSelector)) {
				const getTimelineValue = () => parseFloat(refEl.value || 0);
				controllers.set(
					refSelector,
					new TimelineAnimator(getTimelineValue, {
						elementSelector: `[data-anim-controller-ref="${refSelector}"]`,
					})
				);
				refEl.addEventListener("input", () =>
					controllers.get(refSelector).updateTimeline()
				);
			}
			return;
		}

		// 2. Controlled by scroll
		if (el.dataset.animControlledBy) {
			const type = el.dataset.animControlledBy;
			const key = `scroll-${type}`;
			if (!controllers.has(key)) {
				const getTimelineValue = () =>
					type === "scrollLeft" ? window.scrollX : window.scrollY;
				controllers.set(
					key,
					new TimelineAnimator(getTimelineValue, {
						elementSelector: `[data-anim-controlled-by="${type}"]`,
					})
				);
				window.addEventListener("scroll", () =>
					controllers.get(key).updateTimeline()
				);
			}
			return;
		}

		// 3. Triggered loop animation (timed)
		if (el.dataset.animTriggerGroup) {
			const group = el.dataset.animTriggerGroup;
			const key = getKey("timed", group);
			const configEl = document.querySelector(
				`[data-anim-trigger-group="${group}"][data-anim-trigger-config]`
			);
			if (!loopStateMap.has(key)) {
				let cfg = configEl?.dataset.animTriggerConfig;
				cfg = cfg ? JSON.parse(cfg) : {};
				const max = cfg.max || 100;
				const duration = (1000 / (cfg.speed || 60)) * max;
				const autostart = cfg.autostart || false;
				const state = {
					frame: 0,
					max,
					duration,
					animator: null,
					running: false,
					startTime: 0,
					pauseTime: 0,
					once: cfg.once || false,
					reverse: cfg.reverse || false,
					onStart: null,
					onFinish: null,
				};

				const getTimelineValue = () => state.frame;

				state.animator = new TimelineAnimator(getTimelineValue, {
					elementSelector: `[data-anim-trigger-group="${group}"]:not([data-anim-trigger-config])`,
				});

				controllers.set(group, state.animator);
				loopStateMap.set(key, state);

				if (autostart) {
					window.AnimBase.trigger(group);
				}
			}
			return;
		}
	});
}

window.AnimBase.refresh = scanAnimatedElements;

document.addEventListener("DOMContentLoaded", scanAnimatedElements);
