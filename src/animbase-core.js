const splitColor = color =>
	color
		.match(/^([\w]{2})([\w]{2})([\w]{2})([\w]{2})$/)
		.slice(1)
		.map(v => parseInt(v, 16));

const toHexRGBA = s => {
	const found = s.match(/^#(?:([0-f]{3})|([0-f]{4})|([0-f]{6})|([0-f]{8}))$/);
	if (!found) throw Error('Unsupported color format');
	const [, c3, c4, c6, c8] = found;
	return c3
		? c3
				.split('')
				.map(v => v + v)
				.join('') + 'ff'
		: c4
		? c4
				.split('')
				.map(v => v + v)
				.join('')
		: c6
		? c6 + 'ff'
		: c8;
};
const interpolateColor = (t, color1, color2) => {
	const cInt1 = splitColor(toHexRGBA(color1));
	const cInt2 = splitColor(toHexRGBA(color2));
	return (
		'#' +
		cInt1
			.map((v, i) =>
				Math.round(Math.max(0, Math.min(255, v + (cInt2[i] - v) * t)))
					.toString(16)
					.padStart(2, '0')
			)
			.join('')
	);
};

const easingFunctions = {
	linear: t => t,
	ease: t => t * t * (3 - 2 * t),
	in: t => t * t * t,
	out: t => 1 - Math.pow(1 - t, 3),
	inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
	// fungsi easing lainnya:
	inQuad: t => t * t,
	outQuad: t => t * (2 - t),
	inOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
	inCubic: t => t * t * t,
	outCubic: t => --t * t * t + 1,
	inOutCubic: t => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
	inQuart: t => t * t * t * t,
	outQuart: t => 1 - --t * t * t * t,
	inOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
	inQuint: t => t * t * t * t * t,
	outQuint: t => 1 + --t * t * t * t * t,
	inOutQuint: t => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
	inSine: t => 1 - Math.cos((t * Math.PI) / 2),
	outSine: t => Math.sin((t * Math.PI) / 2),
	inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
	inExpo: t => (0 === t ? 0 : Math.pow(2, 10 * (t - 1))),
	outExpo: t => (1 === t ? 1 : 1 - Math.pow(2, -10 * t)),
	inOutExpo: t =>
		0 === t ? 0 : 1 === t ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, 10 - 20 * t)) / 2,
	inCirc: t => 1 - Math.sqrt(1 - Math.pow(t, 2)),
	outCirc: t => Math.sqrt(1 - Math.pow(t - 1, 2)),
	inOutCirc: t =>
		t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
	inBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
	outBack: t => 1 + 2.70158 * --t * t * t + 1.70158 * t * t,
	inOutBack: t =>
		t < 0.5
			? (Math.pow(2 * t, 2) * ((2.5949095 + 1) * 2 * t - 2.5949095)) / 2
			: (Math.pow(2 * t - 2, 2) * ((2.5949095 + 1) * (t * 2 - 2) + 2.5949095) + 2) / 2,
	inElastic: t => (0 === t ? 0 : 1 === t ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin(((t * 10 - 10.75) * 2 * Math.PI) / 3)),
	outElastic: t => (0 === t ? 0 : 1 === t ? 1 : Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * 2 * Math.PI) / 3) + 1),
	inOutElastic: t =>
		0 === t
			? 0
			: 1 === t
			? 1
			: t < 0.5
			? -(Math.pow(2, 20 * t - 10) * Math.sin(((20 * t - 11.125) * 2 * Math.PI) / 4.5)) / 2
			: (Math.pow(2, -20 * t + 10) * Math.sin(((20 * t - 11.125) * 2 * Math.PI) / 4.5)) / 2 + 1,
	inBounce: t => 1 - easingFunctions.outBounce(1 - t),
	outBounce: t =>
		t < 1 / 2.75
			? 7.5625 * t * t
			: t < 2 / 2.75
			? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
			: t < 2.5 / 2.75
			? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
			: 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375,
	inOutBounce: t =>
		t < 0.5 ? (1 - easingFunctions.outBounce(1 - 2 * t)) / 2 : (1 + easingFunctions.outBounce(2 * t - 1)) / 2,
	spring: (t, stiffness = 4.5, damping = 6) => 1 - Math.cos(t * stiffness * Math.PI) * Math.exp(-t * damping),
};

const linearInterpolation = (a, aMin, aMax, bMin, bMax) => bMin + ((a - aMin) * (bMax - bMin)) / (aMax - aMin);

let re = {
	color: /#[0-f]{3,}/,
	number: /-?\d+(?:\.\d+)?/,
	unit: /[%a-zA-Z]*/,
	func: /[a-zA-Z]+/,
};
re = {
	...re,
	numberWithOptionalUnit: new RegExp(`(?:(${re.color.source})|(?:(${re.number.source})(${re.unit.source})?))`),
};
re = {
	...re,
	numberWithOptionalUnitAndFunc: new RegExp(`${re.numberWithOptionalUnit.source}(?:\\.(${re.func.source}))?`),
};

const parseExpression = s => {
	const rege = RegExp(re.numberWithOptionalUnitAndFunc.source, 'g');
	let arr;
	let r = [];
	while ((arr = rege.exec(s)) !== null) {
		let [text, color, sValue, unit, func] = arr;
		if (func && !easingFunctions[func]) throw Error(`Invalid easing function: ${func}`);
		r.push({
			type: color ? 'color' : 'number',
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
		str = str.substring(0, fromIndex) + replacer[i] + str.substring(toIndex);
	}
	return str;
}

const getValue = ({startValue, endValue, startFrame = 0, endFrame, currentFrame, func = 'linear', type} = {}) => {
	if (startValue === endValue) return startValue;
	let normalValue = linearInterpolation(currentFrame, startFrame, endFrame, 0, 1);
	const easeValue = easingFunctions[func](normalValue);
	if (type === 'color') return interpolateColor(easeValue, startValue, endValue);
	return linearInterpolation(easeValue, 0, 1, startValue, endValue);
};

class AnimatedElement {
	constructor(element, {init = null, config = null} = {}) {
		this.element = element;
		this.setConfig({init, config});
	}

	setConfig({init = null, config = null} = {}) {
		const animInit = this.element.dataset.animInit;
		const animConfig = this.element.dataset.animConfig;
		if (!init || !config) {
			// fallback dari DOM dataset
			try {
				init = animInit ? JSON.parse(animInit) : {};
			} catch (e) {
				console.debug(animInit);
				console.error(e);
			}
			try {
				config = animConfig ? JSON.parse(animConfig) : {};
			} catch (e) {
				console.debug(animConfig);
				console.error(e);
			}
		}
		this.rawInit = init;
		this.rawConfig = config;

		const styleConfig = {};
		let startFrame = 0;
		let ref = {};
		let initialRef = {};

		for (let [prop, str] of Object.entries(init)) {
			initialRef[prop] = parseExpression(str);
			ref[prop] = [...initialRef[prop]];
		}
		for (let [k, props] of Object.entries(config)) {
			if (k === '0') continue;
			const endFrame = parseInt(k);
			styleConfig[k] = {startFrame, endFrame, ref, props: {}};
			for (let [prop, str] of Object.entries(props)) {
				const values = parseExpression(str);
				ref = {...ref, [prop]: values};
				styleConfig[k].props[prop] = values;
			}
			startFrame = endFrame + 1;
		}

		this.initial = init;
		this.initialRef = initialRef;
		this.styleConfig = styleConfig;
	}

	update(currentFrame, debug = false) {
		let result = {};
		const entries = Object.entries(this.styleConfig);
		const found = entries.find(([, d]) => currentFrame >= d.startFrame && currentFrame <= d.endFrame);
		if (found) {
			const detail = found[1];
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
								})}${vi.unit || ''}`
					  )
					: v.map(vi => `${vi.value}${vi.unit || ''}`);
				const r = replaceString(this.initial[prop], this.initialRef[prop], replacer);
				if (debug) result[prop] = r;
				else this.element.style[prop] = r;
			}
		} else {
			const detail = entries.at(-1)[1];
			for (let [prop, v] of Object.entries(detail.ref)) {
				const replacer = detail.props[prop]
					? detail.props[prop].map(vi => `${vi.value}${vi.unit || ''}`)
					: v.map(vi => `${vi.value}${vi.unit || ''}`);
				const r = replaceString(this.initial[prop], this.initialRef[prop], replacer);
				if (debug) result[prop] = r;
				else this.element.style[prop] = r;
			}
		}
		return debug ? result : undefined;
	}
}

class TimelineAnimator {
	constructor(getTimelineValue, options = {}) {
		this.getTimelineValue = getTimelineValue;
		this.animatedElements = new Map();
		this.timelineValue = 0;

		this.elementSelector = options.elementSelector || '[data-anim-config]';
		this.autoCollect = options.autoCollect ?? true;
		this.autoUpdate = options.autoUpdate ?? true;

		if (this.autoCollect) this.collectAnimatedElements();
		if (this.autoUpdate) this.updateTimeline(); // Optional init render
	}

	collectAnimatedElements() {
		const elements = document.querySelectorAll(this.elementSelector);
		elements.forEach(el => this.addElement(el));
	}

	addElement(element, config = {}) {
		const animated = element instanceof AnimatedElement ? element : new AnimatedElement(element, config);
		this.animatedElements.set(animated.element, animated);
	}

	removeElement(element) {
		this.animatedElements.delete(element);
	}

	updateTimeline() {
		this.timelineValue = this.getTimelineValue();
		this.updateAllAnimatedElements();
	}

	updateAllAnimatedElements() {
		this.animatedElements.forEach(ae => ae.update(this.timelineValue));
	}
}

export {AnimatedElement, TimelineAnimator, easingFunctions, parseExpression, linearInterpolation};
