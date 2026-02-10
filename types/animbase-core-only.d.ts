/**
 * Represents a map of CSS style properties and their string values.
 * Example: { opacity: "0.5", transform: "scale(1.2)" }
 */
export interface StyleConfig {
	[key: string]: string;
}

/**
 * Represents a keyframe animation configuration.
 * Each key is a frame number (as a string) mapped to a StyleConfig object.
 */
export interface KeyframeConfig {
	[key: number]: StyleConfig;
}

/**
 * Defines the initial style configuration.
 * Alias of StyleConfig for clarity.
 */
export type InitConfig = StyleConfig;

/**
 * Complete animation configuration for a single element.
 * Can include both the initial style and keyframe definitions.
 */
export interface ElementConfig {
	init?: InitConfig;
	config?: KeyframeConfig;
}

/**
 * Options passed to create a timed animator.
 * Includes optional selectors and animation parameters.
 */
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

export interface ParseExpressionOptions {
	/** Throw on invalid easing when true (default: false). */
	strict?: boolean;
	/** Optional context used for warnings. */
	context?: string;
}

/**
 * Parses an expression string and returns an array of ParsedValue objects.
 * @param str - The expression string to parse.
 * @param options - Optional parsing options.
 * @returns An array of ParsedValue objects.
 */
export function parseExpression(str: string, options?: ParseExpressionOptions): ParsedValue[];

/**
 * Performs linear interpolation between two values.
 * @param a - The current value.
 * @param aMin - The minimum value.
 * @param aMax - The maximum value.
 * @param bMin - The minimum value of the target range.
 * @param bMax - The maximum value of the target range.
 * @returns The interpolated value.
 */
export function linearInterpolation(a: number, aMin: number, aMax: number, bMin: number, bMax: number): number;

/**
 * Represents an animated element.
 */
export class AnimatedElement {
	/**
	 * Creates a new AnimatedElement instance.
	 * @param element - The HTML element to animate.
	 * @param options - Optional configuration for the animation.
	 */
	constructor(element: HTMLElement, options?: ElementConfig);
	/**
	 * Sets the configuration for the animation.
	 * @param config - Optional configuration for the animation.
	 */
	setConfig(config?: ElementConfig): void;
	/**
	 * Updates the animation for the current frame.
	 * @param currentFrame - The current frame number.
	 * @param debug - Optional flag to enable debug mode.
	 * @returns The updated style configuration for the element.
	 */
	update(currentFrame: number, debug?: boolean): Record<string, string> | void;
}

/**
 * Represents a timeline animator.
 */
export class TimelineAnimator {
	/**
	 * Creates a new TimelineAnimator instance.
	 * @param getTimelineValue - A function that returns the current timeline value.
	 * @param options - Optional configuration for the animator.
	 */
	constructor(
		getTimelineValue: () => number,
		options?: {
			elementSelector?: string;
			autoCollect?: boolean;
			autoUpdate?: boolean;
		}
	);
	/**
	 * Adds an element to the animator.
	 * @param element - The HTML element or AnimatedElement instance to add.
	 * @param config - Optional configuration for the animation.
	 */
	addElement(element: HTMLElement | AnimatedElement, config?: ElementConfig): void;
	/**
	 * Removes an element from the animator.
	 * @param element - The HTML element to remove.
	 */
	removeElement(element: HTMLElement): void;
	/**
	 * Updates the timeline value.
	 */
	updateTimeline(): void;
	/**
	 * Updates all animated elements.
	 */
	updateAllAnimatedElements(): void;
}

/**
 * Registers a handler for a specific property key.
 * Accepts a handler function or a handler type string.
 */
export function registerKeyHandler(
	key: string,
	handlerTypeOrFn: string | ((el: HTMLElement, key: string, val: string) => void)
): void;

/**
 * Registers a handler type for use with registerKeyHandler.
 */
export function registerHandlerType(
	type: string,
	handlerFn: (el: HTMLElement, key: string, val: string) => void
): void;
