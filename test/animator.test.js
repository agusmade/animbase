import {describe, it, expect, vi, beforeEach} from 'vitest';
import {TimelineAnimator} from '../src/animbase-core.js';

describe('TimelineAnimator', () => {
	let element, animator;

	beforeEach(() => {
		// Simulasi elemen DOM dengan atribut animasi
		element = document.createElement('div');
		element.dataset.animInit = JSON.stringify({
			transform: 'translateX(0px)',
		});
		element.dataset.animConfig = JSON.stringify({
			100: {
				transform: 'translateX(100px)',
			},
		});

		// Sisipkan ke DOM agar querySelector dapat menemukannya (jika perlu)
		document.body.appendChild(element);

		// TimelineAnimator dengan nilai tetap
		animator = new TimelineAnimator(() => 50, {
			autoCollect: false,
			autoUpdate: false,
		});
	});

	it('adds element and applies update based on timeline value', () => {
		animator.addElement(element);
		animator.updateTimeline();

		// Karena pada frame 50, seharusnya transform masih berupa nilai interpolasi,
		// tapi karena default easing linear dan tidak ada easing, kita tes stringnya berubah
		expect(element.style.transform).toContain('px');
	});

	it('removes element correctly', () => {
		animator.addElement(element);
		animator.removeElement(element);
		expect(animator.animatedElements.has(element)).toBe(false);
	});

	it('collects elements automatically when autoCollect is true', () => {
		const auto = new TimelineAnimator(() => 0, {
			autoCollect: true,
			autoUpdate: false,
			elementSelector: '[data-anim-init]',
		});
		expect(auto.animatedElements.has(element)).toBe(true);
	});

	it('updates all animated elements based on timeline value', () => {
		animator.addElement(element);

		// Spy pada method update di AnimatedElement
		const ae = animator.animatedElements.get(element);
		const updateSpy = vi.spyOn(ae, 'update');

		animator.updateTimeline();

		expect(updateSpy).toHaveBeenCalledWith(50);
	});

	afterEach(() => {
		document.body.removeChild(element);
	});
});
