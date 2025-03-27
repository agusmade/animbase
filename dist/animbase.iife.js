var AnimBase = (function (exports) {
	'use strict';

	const splitColor = (color) =>
		color
			.match(/^([\w]{2})([\w]{2})([\w]{2})([\w]{2})$/)
			.slice(1)
			.map((v) => parseInt(v, 16));

	const toHexRGBA = (s) => {
		const found = s.match(/^#(?:([0-f]{3})|([0-f]{4})|([0-f]{6})|([0-f]{8}))$/);
		if (!found) throw Error("Unsupported color format");
		const [, c3, c4, c6, c8] = found;
		return c3
			? c3
					.split("")
					.map((v) => v + v)
					.join("") + "ff"
			: c4
			? c4
					.split("")
					.map((v) => v + v)
					.join("")
			: c6
			? c6 + "ff"
			: c8;
	};
	const interpolateColor = (t, color1, color2) => {
		const cInt1 = splitColor(toHexRGBA(color1));
		const cInt2 = splitColor(toHexRGBA(color2));
		return (
			"#" +
			cInt1
				.map((v, i) =>
					Math.round(Math.max(0, Math.min(255, v + (cInt2[i] - v) * t)))
						.toString(16)
						.padStart(2, "0")
				)
				.join("")
		);
	};

	const easingFunctions = {
		linear: (t) => t,
		ease: (t) => t * t * (3 - 2 * t),
		in: (t) => t * t * t,
		out: (t) => 1 - Math.pow(1 - t, 3),
		inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
		// fungsi easing lainnya:
		inQuad: (t) => t * t,
		outQuad: (t) => t * (2 - t),
		inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
		inCubic: (t) => t * t * t,
		outCubic: (t) => --t * t * t + 1,
		inOutCubic: (t) =>
			t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
		inQuart: (t) => t * t * t * t,
		outQuart: (t) => 1 - --t * t * t * t,
		inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
		inQuint: (t) => t * t * t * t * t,
		outQuint: (t) => 1 + --t * t * t * t * t,
		inOutQuint: (t) =>
			t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
		inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
		outSine: (t) => Math.sin((t * Math.PI) / 2),
		inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
		inExpo: (t) => (0 === t ? 0 : Math.pow(2, 10 * (t - 1))),
		outExpo: (t) => (1 === t ? 1 : 1 - Math.pow(2, -10 * t)),
		inOutExpo: (t) =>
			0 === t
				? 0
				: 1 === t
				? 1
				: t < 0.5
				? Math.pow(2, 20 * t - 10) / 2
				: (2 - Math.pow(2, 10 - 20 * t)) / 2,
		inCirc: (t) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
		outCirc: (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
		inOutCirc: (t) =>
			t < 0.5
				? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
				: (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
		inBack: (t) => 2.70158 * t * t * t - 1.70158 * t * t,
		outBack: (t) => 1 + 2.70158 * --t * t * t + 1.70158 * t * t,
		inOutBack: (t) =>
			t < 0.5
				? (Math.pow(2 * t, 2) * ((2.5949095 + 1) * 2 * t - 2.5949095)) / 2
				: (Math.pow(2 * t - 2, 2) *
						((2.5949095 + 1) * (t * 2 - 2) + 2.5949095) +
						2) /
				  2,
		inElastic: (t) =>
			0 === t
				? 0
				: 1 === t
				? 1
				: -Math.pow(2, 10 * t - 10) *
				  Math.sin(((t * 10 - 10.75) * 2 * Math.PI) / 3),
		outElastic: (t) =>
			0 === t
				? 0
				: 1 === t
				? 1
				: Math.pow(2, -10 * t) *
						Math.sin(((t * 10 - 0.75) * 2 * Math.PI) / 3) +
				  1,
		inOutElastic: (t) =>
			0 === t
				? 0
				: 1 === t
				? 1
				: t < 0.5
				? -(
						Math.pow(2, 20 * t - 10) *
						Math.sin(((20 * t - 11.125) * 2 * Math.PI) / 4.5)
				  ) / 2
				: (Math.pow(2, -20 * t + 10) *
						Math.sin(((20 * t - 11.125) * 2 * Math.PI) / 4.5)) /
						2 +
				  1,
		inBounce: (t) => 1 - easingFunctions.outBounce(1 - t),
		outBounce: (t) =>
			t < 1 / 2.75
				? 7.5625 * t * t
				: t < 2 / 2.75
				? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
				: t < 2.5 / 2.75
				? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
				: 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375,
		inOutBounce: (t) =>
			t < 0.5
				? (1 - easingFunctions.outBounce(1 - 2 * t)) / 2
				: (1 + easingFunctions.outBounce(2 * t - 1)) / 2,
		spring: (t, stiffness = 4.5, damping = 6) =>
			1 - Math.cos(t * stiffness * Math.PI) * Math.exp(-t * damping),
	};

	const linearInterpolation = (a, aMin, aMax, bMin, bMax) =>
		bMin + ((a - aMin) * (bMax - bMin)) / (aMax - aMin);

	let re = {
		color: /#[0-f]{3,}/,
		number: /-?\d+(?:\.\d+)?/,
		unit: /[%a-zA-Z]*/,
		func: /[a-zA-Z]+/,
	};
	re = {
		...re,
		numberWithOptionalUnit: new RegExp(
			`(?:(${re.color.source})|(?:(${re.number.source})(${re.unit.source})?))`
		),
	};
	re = {
		...re,
		numberWithOptionalUnitAndFunc: new RegExp(
			`${re.numberWithOptionalUnit.source}(?:\\.(${re.func.source}))?`
		),
	};

	const parseExpression = (s) => {
		const rege = RegExp(re.numberWithOptionalUnitAndFunc.source, "g");
		let arr;
		let r = [];
		while ((arr = rege.exec(s)) !== null) {
			let [text, color, sValue, unit, func] = arr;
			if (func && !easingFunctions[func])
				throw Error(`Invalid easing function: ${func}`);
			r.push({
				type: color ? "color" : "number",
				text,
				value: color ? color : parseFloat(sValue),
				unit,
				func,
				lastIndex: rege.lastIndex,
			});
		}
		return r;
	};

	function replaceString(str, _ref, _replacer) {
		let ref = [..._ref].reverse();
		let replacer = [..._replacer].reverse();
		for (let i = 0; i < ref.length; i++) {
			const fromIndex = ref[i].lastIndex - ref[i].text.length;
			const toIndex = ref[i].lastIndex;
			str =
				str.substring(0, fromIndex) + replacer[i] + str.substring(toIndex);
		}
		return str;
	}

	const getValue = ({
		startValue,
		endValue,
		startFrame = 0,
		endFrame,
		currentFrame,
		func = "linear",
		type,
	} = {}) => {
		if (startValue === endValue) return startValue;
		let normalValue = linearInterpolation(
			currentFrame,
			startFrame,
			endFrame,
			0,
			1
		);
		const easeValue = easingFunctions[func](normalValue);
		if (type === "color")
			return interpolateColor(easeValue, startValue, endValue);
		return linearInterpolation(easeValue, 0, 1, startValue, endValue);
	};

	class AnimatedElement {
		constructor(element, options = {}) {
			this.element = element;
			const config = element.dataset.animConfig
				? JSON.parse(element.dataset.animConfig)
				: {};
			const initial = element.dataset.animInit
				? JSON.parse(element.dataset.animInit)
				: {};
			const styleConfig = {};

			let startFrame = 0;
			let initialRef = {};
			let ref = {};
			for (let [prop, s] of Object.entries(initial)) {
				initialRef[prop] = parseExpression(s);
				ref[prop] = [...initialRef[prop]];
			}
			for (let [kFrame, props] of Object.entries(config)) {
				const endFrame = parseInt(kFrame, 10);
				styleConfig[kFrame] = { startFrame, endFrame, ref, props: {} };
				for (let [prop, s] of Object.entries(props)) {
					const values = parseExpression(s);
					ref = { ...ref, [prop]: values };
					styleConfig[kFrame].props[prop] = values;
				}
				startFrame = endFrame + 1;
			}
			this.styleConfig = styleConfig;
			// this.keyFrames = kfs;

			this.update = (currentFrame, debug = false) => {
				let r = {};
				const aStyleConfig = Object.entries(styleConfig);
				const kf = aStyleConfig.find(
					([, detail]) =>
						detail.startFrame <= currentFrame &&
						detail.endFrame >= currentFrame
				);
				if (kf) {
					const detail = kf[1];
					for (let [prop, v] of Object.entries(detail.ref)) {
						const replacer = detail.props[prop]
							? detail.props[prop].map(
									(vi, i) =>
										`${getValue({
										startValue: v[i].value,
										endValue: vi.value,
										startFrame: detail.startFrame,
										endFrame: detail.endFrame,
										currentFrame,
										func: vi.func,
										type: vi.type,
									})}${vi.unit || ""}`
							  )
							: v.map((vi) => `${vi.value}${vi.unit || ""}`);
						// console.log(`${prop}:`, {str: initial[prop], ref: initialRef[prop], replacer});
						if (debug)
							r[prop] = replaceString(
								initial[prop],
								initialRef[prop],
								replacer
							);
						else
							this.element.style[prop] = replaceString(
								initial[prop],
								initialRef[prop],
								replacer
							);
					}
				} else {
					const detail = aStyleConfig[aStyleConfig.length - 1][1];
					for (let [prop, v] of Object.entries(detail.ref)) {
						const replacer = detail.props[prop]
							? detail.props[prop].map(
									(vi) => `${vi.value}${vi.unit || ""}`
							  )
							: v.map((vi) => `${vi.value}${vi.unit || ""}`);
						if (debug)
							r[prop] = replaceString(
								initial[prop],
								initialRef[prop],
								replacer
							);
						else
							this.element.style[prop] = replaceString(
								initial[prop],
								initialRef[prop],
								replacer
							);
					}
				}
				if (debug) return r;
			};
		}
	}

	class TimelineAnimator {
		constructor(getTimelineValue, options = {}) {
			this.getTimelineValue = getTimelineValue;
			this.animatedElements = new Map();
			this.timelineValue = 0;
			this.elementSelector = options.elementSelector || "[data-anim-config]";

			this.collectAnimatedElements();
			this.updateTimeline(); // Inisialisasi pada load
		}

		collectAnimatedElements() {
			const elements = document.querySelectorAll(this.elementSelector);
			elements.forEach((element) => {
				if (!element.dataset.animConfig) return;
				const animatedElement = new AnimatedElement(element);
				this.animatedElements.set(element, animatedElement);
			});
		}

		updateTimeline() {
			this.timelineValue = this.getTimelineValue();
			this.updateAllAnimatedElements();
		}

		updateAllAnimatedElements() {
			this.animatedElements.forEach((animatedElement) => {
				animatedElement.update(this.timelineValue);
			});
		}
	}

	var AnimBaseCore = /*#__PURE__*/Object.freeze({
		__proto__: null,
		AnimatedElement: AnimatedElement,
		TimelineAnimator: TimelineAnimator,
		easingFunctions: easingFunctions,
		linearInterpolation: linearInterpolation,
		parseExpression: parseExpression
	});

	// autoinit.js (refactored with 3 controller types)


	const loopStateMap = new Map();
	const controllers = new Map();

	window.AnimBase = window.AnimBase || {};

	function getKey(type, groupOrId = "") {
		return `timed::${groupOrId}` ;
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

	// Untuk IIFE dan global
	if (typeof window !== "undefined") {
		window.AnimBase = window.AnimBase || {};
		Object.assign(window.AnimBase, AnimBaseCore);
	}

	exports.AnimatedElement = AnimatedElement;
	exports.TimelineAnimator = TimelineAnimator;
	exports.easingFunctions = easingFunctions;
	exports.linearInterpolation = linearInterpolation;
	exports.parseExpression = parseExpression;

	return exports;

})({});
//# sourceMappingURL=animbase.iife.js.map
