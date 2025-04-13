import {describe, it, expect, beforeEach} from 'vitest';
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
});
