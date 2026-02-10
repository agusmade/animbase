import {describe, it, expect, vi} from 'vitest';
import {AnimatedElement, parseExpression} from '../src/animbase-core.js';

describe('strict mode', () => {
	it('throws on invalid JSON when data-anim-strict="true"', () => {
		const div = document.createElement('div');
		div.dataset.animStrict = 'true';
		div.dataset.animInit = '{invalid';
		div.dataset.animConfig = JSON.stringify({10: {opacity: '1'}});

		expect(() => new AnimatedElement(div)).toThrow();
	});

	it('throws on invalid color format when data-anim-strict="true"', () => {
		const div = document.createElement('div');
		div.dataset.animStrict = 'true';
		div.dataset.animInit = JSON.stringify({color: '#12345'});
		div.dataset.animConfig = JSON.stringify({10: {color: '#67890'}});

		const ae = new AnimatedElement(div);
		expect(() => ae.update(5)).toThrow();
	});

	it('throws on invalid easing when strict is true', () => {
		expect(() => parseExpression('10px.badEase', {strict: true})).toThrow();
	});
});

describe('warn-once behavior', () => {
	it('warns once for invalid easing in non-strict mode', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		parseExpression('10px.badEase', {context: 'warn-once-test-1'});
		parseExpression('20px.badEase', {context: 'warn-once-test-1'});

		expect(warnSpy).toHaveBeenCalledTimes(1);
		warnSpy.mockRestore();
	});

	it('warns on invalid JSON in non-strict mode', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const div = document.createElement('div');
		div.dataset.animInit = '{invalid';
		div.dataset.animConfig = '{invalid';

		expect(() => new AnimatedElement(div)).not.toThrow();
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});
