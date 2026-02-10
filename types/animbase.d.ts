export * from './animbase-core-only';

export function trigger(
	group?: string,
	options?: {
		from?: number;
		to?: number;
		speed?: number;
		once?: boolean;
		reverse?: boolean;
		max?: number;
		onStart?: () => void;
		onFinish?: () => void;
	}
): void;

export function pause(group?: string): void;
export function resume(group?: string): void;
export function stop(group?: string): void;
export function seek(group?: string, frame: number): void;
export function setReverse(group?: string, reverse: boolean): void;
export function setOnce(group?: string, once: boolean): void;
export function setHooks(
	group?: string,
	hooks: {
		onStart?: () => void;
		onFinish?: () => void;
	}
): void;

export function registerKeyHandler(
	key: string,
	handlerTypeOrFn: string | ((el: HTMLElement, key: string, val: string) => void)
): void;

export function registerHandlerType(
	type: string,
	handlerFn: (el: HTMLElement, key: string, val: string) => void
): void;

export function getAnimator(group?: string): TimelineAnimator;
export function createTimedAnimator(
	group: string,
	options?: AnimatorOptions & {
		elementSelector?: string;
		configSelector?: string;
		onStart?: () => void;
		onFinish?: () => void;
	}
): TimelineAnimator;

export function refresh(): void;
export const play: typeof trigger;
export const setProgress: typeof seek;
