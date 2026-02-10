import {describe, it, expect, beforeEach, vi} from 'vitest';
import {AnimatedElement} from '../src/animbase-core.js';

describe('AnimatedElement', () => {
	let div;

	beforeEach(() => {
		// Simulasi elemen DOM
		div = document.createElement('div');
		div.dataset.animInit = JSON.stringify({
			opacity: '0',
			transform: 'translateX(0px)',
		});
		div.dataset.animConfig = JSON.stringify({
			100: {
				opacity: '1.out',
				transform: 'translateX(100px.out)',
			},
		});
	});

	it('can be constructed from DOM element with dataset', () => {
		const ae = new AnimatedElement(div);
		expect(ae.element).toBe(div);
		expect(ae.initial).toHaveProperty('opacity');
		expect(ae.rawConfig).toHaveProperty('100');
	});

	it('applies correct style at frame 0 (initial)', () => {
		const ae = new AnimatedElement(div);
		ae.update(0);
		expect(div.style.opacity).toBe('0');
		expect(div.style.transform).toBe('translateX(0px)');
	});

	it('interpolates styles at mid frame', () => {
		const ae = new AnimatedElement(div);
		ae.update(50); // Di tengah frame 0 dan 100
		// Karena easing default linear dan value dari 0 ke 1
		expect(parseFloat(div.style.opacity)).toBeGreaterThan(0);
		expect(parseFloat(div.style.opacity)).toBeLessThan(1);
	});

	it('applies final styles at last frame', () => {
		const ae = new AnimatedElement(div);
		ae.update(100);
		expect(div.style.opacity).toBe('1');
		expect(div.style.transform).toBe('translateX(100px)');
	});

	it('returns debug values and skips duplicate frames', () => {
		const ae = new AnimatedElement(div);
		const first = ae.update(0, true);
		expect(first).toHaveProperty('opacity');
		expect(first).toHaveProperty('transform');

		const second = ae.update(0, true);
		expect(second).toEqual({});
	});

	it('uses last keyframe values when frame is beyond range', () => {
		const ae = new AnimatedElement(div);
		ae.update(200);
		expect(div.style.opacity).toBe('1');
		expect(div.style.transform).toBe('translateX(100px)');
	});

	it('applies setAttribute handler for viewBox', () => {
		const svg = document.createElement('svg');
		svg.dataset.animInit = JSON.stringify({viewBox: '0 0 10 10'});
		svg.dataset.animConfig = JSON.stringify({100: {viewBox: '0 0 20 20'}});

		const ae = new AnimatedElement(svg);
		ae.update(100);

		expect(svg.getAttribute('viewBox')).toBe('0 0 20 20');
	});

	it('applies textContent handler for text', () => {
		const divText = document.createElement('div');
		divText.dataset.animInit = JSON.stringify({text: 'Count: 0'});
		divText.dataset.animConfig = JSON.stringify({10: {text: 'Count: 10'}});

		const ae = new AnimatedElement(divText);
		ae.update(10);

		expect(divText.textContent).toBe('Count: 10');
	});

	it('falls back on invalid color format in non-strict mode', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const divColor = document.createElement('div');
		divColor.dataset.animInit = JSON.stringify({color: '#fffff'});
		divColor.dataset.animConfig = JSON.stringify({10: {color: '#12345'}});

		const ae = new AnimatedElement(divColor);
		const debug = ae.update(10, true);

		expect(debug.color).toBe('#12345');
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});
