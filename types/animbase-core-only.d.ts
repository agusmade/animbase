export interface AnimatorOptions {
	/** Animation speed in frame units */
	speed?: number;
	/** Maximum frame value */
	max?: number;
	/** Start automatically on init */
	autostart?: boolean;
	/** Play only once */
	once?: boolean;
	/** Play in reverse */
	reverse?: boolean;
	// /** Frame interval (ms) for auto updates */
	// interval?: number;
}

export interface KeyframeConfig {
	[key: number]: Record<string, string>;
}

export interface InitConfig {
	[key: string]: string;
}

export interface ElementConfig {
	init?: InitConfig;
	config?: KeyframeConfig;
}

export interface ParsedValue {
	type: 'color' | 'number';
	text: string;
	value: number | string;
	unit?: string;
	func?: string;
	lastIndex: number;
}

export type EasingFunction = (t: number) => number;

export const easingFunctions: Record<string, EasingFunction>;

export function parseExpression(str: string): ParsedValue[];

export function linearInterpolation(a: number, aMin: number, aMax: number, bMin: number, bMax: number): number;

export class AnimatedElement {
	constructor(element: HTMLElement, options?: ElementConfig);
	setConfig(config?: ElementConfig): void;
	update(currentFrame: number, debug?: boolean): Record<string, string> | void;
}

export class TimelineAnimator {
	constructor(
		getTimelineValue: () => number,
		options?: {
			elementSelector?: string;
			autoCollect?: boolean;
			autoUpdate?: boolean;
		}
	);
	addElement(element: HTMLElement | AnimatedElement, config?: ElementConfig): void;
	removeElement(element: HTMLElement): void;
	updateTimeline(): void;
	updateAllAnimatedElements(): void;
}
