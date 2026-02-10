import {describe, it, expect, vi} from 'vitest';
import {AnimatedElement, registerHandlerType, registerKeyHandler} from '../src/animbase-core.js';

describe('registerKeyHandler', () => {
	it('uses a custom handler function for a property', () => {
		const div = document.createElement('div');
		registerKeyHandler('customPropFn', (el, key, val) => {
			el.dataset.customApplied = `${key}:${val}`;
		});

		div.dataset.animInit = JSON.stringify({customPropFn: '0'});
		div.dataset.animConfig = JSON.stringify({10: {customPropFn: '5'}});

		const ae = new AnimatedElement(div);
		ae.update(10);

		expect(div.dataset.customApplied).toBe('customPropFn:5');
	});

	it('uses a mapped handler type for a property', () => {
		const div = document.createElement('div');
		registerKeyHandler('customPropAttr', 'setAttribute');

		div.dataset.animInit = JSON.stringify({customPropAttr: '0'});
		div.dataset.animConfig = JSON.stringify({10: {customPropAttr: '5'}});

		const ae = new AnimatedElement(div);
		ae.update(10);

		expect(div.getAttribute('customPropAttr')).toBe('5');
	});

	it('uses a custom handler type registered at runtime', () => {
		const div = document.createElement('div');
		registerHandlerType('dataSet', (el, key, val) => {
			el.dataset[key] = val;
		});
		registerKeyHandler('customPropData', 'dataSet');

		div.dataset.animInit = JSON.stringify({customPropData: '0'});
		div.dataset.animConfig = JSON.stringify({10: {customPropData: '7'}});

		const ae = new AnimatedElement(div);
		ae.update(10);

		expect(div.dataset.customPropData).toBe('7');
	});

	it('warns once for unknown handler type', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		registerKeyHandler('customPropWarn1', 'unknownTypeX');
		registerKeyHandler('customPropWarn2', 'unknownTypeX');

		expect(warnSpy).toHaveBeenCalledTimes(1);
		warnSpy.mockRestore();
	});
});

describe('built-in key handlers', () => {
	it('applies cssVar handler for custom properties', () => {
		const div = document.createElement('div');
		div.dataset.animInit = JSON.stringify({'--tw': '0px'});
		div.dataset.animConfig = JSON.stringify({10: {'--tw': '5px'}});

		const ae = new AnimatedElement(div);
		ae.update(10);

		expect(div.style.getPropertyValue('--tw')).toBe('5px');
	});

	it('applies scrollProp handler for scrollTop', () => {
		const div = document.createElement('div');
		div.dataset.animInit = JSON.stringify({scrollTop: '0'});
		div.dataset.animConfig = JSON.stringify({10: {scrollTop: '20'}});

		const ae = new AnimatedElement(div);
		ae.update(10);

		expect(div.scrollTop).toBe(20);
	});

	it('applies prop handler for currentTime', () => {
		const div = document.createElement('div');
		div.dataset.animInit = JSON.stringify({currentTime: '0'});
		div.dataset.animConfig = JSON.stringify({10: {currentTime: '5'}});

		const ae = new AnimatedElement(div);
		ae.update(10);

		expect(div.currentTime).toBe('5');
	});
});
