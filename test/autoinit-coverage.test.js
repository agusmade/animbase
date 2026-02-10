import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import AnimBase from '../src/autoinit.js';

describe('autoinit coverage', () => {
	const cleanup = [];

	const add = el => {
		document.body.appendChild(el);
		cleanup.push(el);
		return el;
	};

	afterEach(() => {
		while (cleanup.length) {
			const el = cleanup.pop();
			if (el?.parentNode) el.parentNode.removeChild(el);
		}
	});

	beforeEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('maps scrollTop on window to scrollY and sets controller ref', () => {
		const el = add(document.createElement('div'));
		el.dataset.animInit = JSON.stringify({opacity: '0'});
		el.dataset.animConfig = JSON.stringify({100: {opacity: '1'}});
		el.dataset.animControlledBy = 'scrollTop';

		AnimBase.refresh();

		expect(el.getAttribute('data-anim-controller-ref')).toBe('window');
		expect(el.getAttribute('data-anim-controlled-by')).toBe('scrollY');
	});

	it('maps scrollY to scrollTop when controller is not window', () => {
		const controller = add(document.createElement('div'));
		controller.id = 'ctrl';

		const el = add(document.createElement('div'));
		el.dataset.animInit = JSON.stringify({opacity: '0'});
		el.dataset.animConfig = JSON.stringify({100: {opacity: '1'}});
		el.dataset.animControllerRef = '#ctrl';
		el.dataset.animControlledBy = 'scrollY';

		AnimBase.refresh();

		expect(el.getAttribute('data-anim-controlled-by')).toBe('scrollTop');
	});

	it('defaults controlled-by to value when controller ref exists', () => {
		const controller = add(document.createElement('input'));
		controller.id = 'range-1';

		const el = add(document.createElement('div'));
		el.dataset.animInit = JSON.stringify({opacity: '0'});
		el.dataset.animConfig = JSON.stringify({100: {opacity: '1'}});
		el.dataset.animControllerRef = '#range-1';

		AnimBase.refresh();

		expect(el.getAttribute('data-anim-controlled-by')).toBe('value');
	});

	it('sets default trigger group when no controller is provided', () => {
		const el = add(document.createElement('div'));
		el.dataset.animInit = JSON.stringify({opacity: '0'});

		AnimBase.refresh();

		expect(el.getAttribute('data-anim-trigger-group')).toBe('default');
	});

	it('warns when controller element is missing', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const el = add(document.createElement('div'));
		el.dataset.animInit = JSON.stringify({opacity: '0'});
		el.dataset.animConfig = JSON.stringify({100: {opacity: '1'}});
		el.dataset.animControllerRef = '#missing';
		el.dataset.animControlledBy = 'value';

		AnimBase.refresh();

		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it('uses custom listen event for external controller', () => {
		const input = add(document.createElement('input'));
		input.id = 'slider-1';
		input.value = '0';

		const el = add(document.createElement('div'));
		el.dataset.animInit = JSON.stringify({opacity: '0'});
		el.dataset.animConfig = JSON.stringify({100: {opacity: '1'}});
		el.dataset.animControllerRef = '#slider-1';
		el.dataset.animControlledBy = 'value';
		el.dataset.animListen = 'change';

		AnimBase.refresh();

		const animator = AnimBase.getAnimator('#slider-1:value');
		expect(animator).toBeDefined();
		const updateSpy = vi.spyOn(animator, 'updateTimeline');

		input.dispatchEvent(new Event('change'));
		expect(updateSpy).toHaveBeenCalled();
	});

	it('autostarts timed animator when configured', () => {
		const anim = add(document.createElement('div'));
		anim.dataset.animTriggerGroup = 'autoGroup';
		anim.dataset.animInit = JSON.stringify({opacity: '0'});
		anim.dataset.animConfig = JSON.stringify({10: {opacity: '1'}});

		const cfg = add(document.createElement('div'));
		cfg.dataset.animTriggerGroup = 'autoGroup';
		cfg.dataset.animTriggerConfig = JSON.stringify({autostart: true, speed: 100, max: 10});

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
		const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(1000);

		AnimBase.refresh();
		const animator = AnimBase.getAnimator('autoGroup');

		expect(animator).toBeDefined();
		expect(animator.state.running).toBe(true);

		rafSpy.mockRestore();
		nowSpy.mockRestore();
	});

	it('calls onFinish in loop when once is false', () => {
		const animator = AnimBase.createTimedAnimator('finishGroup', {max: 10, speed: 10, once: false});
		const onFinish = vi.fn();

		vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
		const nowSpy = vi
			.spyOn(performance, 'now')
			.mockReturnValueOnce(0)
			.mockReturnValueOnce(2000)
			.mockReturnValueOnce(2001);

		AnimBase.play('finishGroup', {onFinish});

		expect(onFinish).toHaveBeenCalled();

		nowSpy.mockRestore();
	});

	it('supports pause/resume and seek', () => {
		AnimBase.createTimedAnimator('controlGroup', {max: 10, speed: 10, once: false});
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
		vi.spyOn(performance, 'now').mockReturnValue(1000);

		AnimBase.play('controlGroup');
		const animator = AnimBase.getAnimator('controlGroup');

		AnimBase.pause('controlGroup');
		expect(animator.state.running).toBe(false);

		AnimBase.resume('controlGroup');
		expect(animator.state.running).toBe(true);

		AnimBase.seek('controlGroup', 20);
		expect(animator.state.frame).toBe(10);
	});

	it('stops and resets frame to start based on reverse flag', () => {
		AnimBase.createTimedAnimator('stopGroup', {max: 10, speed: 10, once: false, reverse: true});
		const animator = AnimBase.getAnimator('stopGroup');
		animator.state.frame = 5;

		AnimBase.stop('stopGroup');

		expect(animator.state.frame).toBe(10);
	});

	it('sets hooks, reverse, and once flags', () => {
		AnimBase.createTimedAnimator('flagsGroup', {max: 10, speed: 10, once: false});
		const onStart = vi.fn();
		const onFinish = vi.fn();

		AnimBase.setHooks('flagsGroup', {onStart, onFinish});
		AnimBase.setReverse('flagsGroup', true);
		AnimBase.setOnce('flagsGroup', true);

		const animator = AnimBase.getAnimator('flagsGroup');
		expect(animator.state.onStart).toBe(onStart);
		expect(animator.state.onFinish).toBe(onFinish);
		expect(animator.state.reverse).toBe(true);
		expect(animator.state.once).toBe(true);
	});
});
