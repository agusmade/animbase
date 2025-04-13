import {describe, it, expect, beforeEach, vi} from 'vitest';
import AnimBase from '../src/autoinit.js';

describe('autoinit.js', () => {
	let element, configElement;

	beforeEach(() => {
		// Dummy element untuk animasi trigger-group
		element = document.createElement('div');
		element.dataset.animInit = JSON.stringify({
			opacity: '0',
		});
		element.dataset.animConfig = JSON.stringify({
			100: {opacity: '1'},
		});
		element.dataset.animTriggerGroup = 'testGroup';

		// Dummy config untuk trigger
		configElement = document.createElement('div');
		configElement.dataset.animTriggerGroup = 'testGroup';
		configElement.dataset.animTriggerConfig = JSON.stringify({
			speed: 60,
			max: 100,
			autostart: false,
		});

		document.body.appendChild(element);
		document.body.appendChild(configElement);
	});

	it('registers trigger-group via DOM and responds to .play()', () => {
		// Trigger scan ulang
		AnimBase.refresh();

		const animator = AnimBase.getAnimator('testGroup');
		expect(animator).toBeDefined();

		// Spy on updateTimeline
		const updateSpy = vi.spyOn(animator, 'updateTimeline');

		// Play group (will trigger animation loop)
		AnimBase.play('testGroup', {once: true, speed: 200, onFinish: () => {}});

		// Wait briefly then assert frame updated
		setTimeout(() => {
			expect(animator.state.running).toBe(true);
			expect(updateSpy).toHaveBeenCalled();
		}, 50);
	});

	it('ignores elements missing required attributes', () => {
		const dummy = document.createElement('div');
		document.body.appendChild(dummy);

		// Should not register any animator
		AnimBase.refresh();

		expect([...(AnimBase.getAnimator.keys || [])]).not.toContain(dummy);
		document.body.removeChild(dummy);
	});

	afterEach(() => {
		document.body.removeChild(element);
		document.body.removeChild(configElement);
	});
});
