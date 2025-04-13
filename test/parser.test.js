import {describe, it, expect} from 'vitest';
import {parseExpression} from '../src/animbase-core.js';

describe('parseExpression', () => {
	/** 🔢 Basic numeric parsing */
	it('parses single numeric value with unit', () => {
		const result = parseExpression('20px');
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({value: 20, unit: 'px', func: undefined});
	});

	it('parses negative decimal with unit and easing', () => {
		const result = parseExpression('-2.5rem.outBack');
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({value: -2.5, unit: 'rem', func: 'outBack'});
	});

	/** 🎨 Color parsing */
	it('parses simple hex color', () => {
		const result = parseExpression('#fff');
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({type: 'color', value: '#fff', func: undefined});
	});

	it('parses hex color with easing', () => {
		const result = parseExpression('#fa2.outBounce');
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({type: 'color', value: '#fa2', func: 'outBounce'});
	});

	/** 📦 Multi-value string */
	it('parses multiple values in one string', () => {
		const result = parseExpression('1px -2.5rem 10% #5bf.outBounce');
		expect(result).toHaveLength(4);
		expect(result[3]).toMatchObject({type: 'color', value: '#5bf', func: 'outBounce'});
	});

	/** 🧠 Function-style values */
	it('parses values inside CSS-like function expressions', () => {
		const result = parseExpression('translateX(100%.spring) rotateZ(45deg.outSine)');
		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({value: 100, unit: '%', func: 'spring'});
		expect(result[1]).toMatchObject({value: 45, unit: 'deg', func: 'outSine'});
	});

	/** 🧪 Graceful fallback on unrecognized input */
	it('returns empty array on non-matching string', () => {
		const result = parseExpression('abc');
		expect(result).toEqual([]);
	});

	it('ignores empty easing dot (e.g. "10.out")', () => {
		const result = parseExpression('10.out');
		expect(result[0]).toMatchObject({value: 10, func: 'out'});
	});
});
