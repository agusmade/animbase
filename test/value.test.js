import {describe, it, expect} from 'vitest';
import {linearInterpolation, easingFunctions} from '../src/animbase-core.js';

describe('linearInterpolation', () => {
	it('maps input range to output range correctly', () => {
		expect(linearInterpolation(0, 0, 100, 0, 200)).toBe(0);
		expect(linearInterpolation(50, 0, 100, 0, 200)).toBe(100);
		expect(linearInterpolation(100, 0, 100, 0, 200)).toBe(200);

		expect(linearInterpolation(25, 0, 100, 10, 20)).toBe(12.5);
		expect(linearInterpolation(75, 0, 100, 10, 20)).toBe(17.5);
	});
});

describe('easingFunctions', () => {
	it('includes linear easing as identity function', () => {
		const linear = easingFunctions.linear;
		expect(linear(0)).toBeCloseTo(0);
		expect(linear(0.5)).toBeCloseTo(0.5);
		expect(linear(1)).toBeCloseTo(1);
	});

	it('applies outQuad easing properly', () => {
		const ease = easingFunctions.outQuad;
		expect(ease(0)).toBeCloseTo(0);
		expect(ease(0.5)).toBeGreaterThan(0.5);
		expect(ease(1)).toBeCloseTo(1);
	});

	it('covers outBounce branches', () => {
		const ease = easingFunctions.outBounce;
		expect(ease(0.1)).toBeGreaterThanOrEqual(0);
		expect(ease(0.6)).toBeGreaterThanOrEqual(0);
		expect(ease(0.8)).toBeGreaterThanOrEqual(0);
		expect(ease(0.95)).toBeGreaterThanOrEqual(0);
	});
});
