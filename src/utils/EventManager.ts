import { Logger } from './Logger';

export type EventCallback<T = any> = (data: T) => void;

export interface EventMap {
	'variable:updated': { name: string; value: string; category: string };
	'variable:deleted': { uuid: string; name: string };
	'variable:created': { name: string; value: string; category: string };
	'rule:updated': { uuid: string; rule: string; css: string };
	'rule:deleted': { uuid: string };
	'rule:created': { rule: string; css: string };
	'search:variable': { term: string; results: number };
	'search:rule': { term: string; results: number };
	'filter:tag': { tag: string; count: number };
	'section:toggled': { section: string; expanded: boolean };
	'theme:toggled': { enabled: boolean };
	'export:started': { type: 'css' | 'manifest' };
	'export:completed': { type: 'css' | 'manifest'; success: boolean };
}

export type EventKey = keyof EventMap;

export class EventManager {
	private listeners = new Map<EventKey, Set<EventCallback>>();
	private onceListeners = new Map<EventKey, Set<EventCallback>>();

	/**
	 * Subscribe to an event
	 */
	on<K extends EventKey>(event: K, callback: EventCallback<EventMap[K]>): () => void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}

		this.listeners.get(event)!.add(callback);

		// Return unsubscribe function
		return () => {
			this.off(event, callback);
		};
	}

	/**
	 * Subscribe to an event that will only fire once
	 */
	once<K extends EventKey>(event: K, callback: EventCallback<EventMap[K]>): () => void {
		if (!this.onceListeners.has(event)) {
			this.onceListeners.set(event, new Set());
		}

		this.onceListeners.get(event)!.add(callback);

		// Return unsubscribe function
		return () => {
			this.offOnce(event, callback);
		};
	}

	/**
	 * Unsubscribe from an event
	 */
	off<K extends EventKey>(event: K, callback: EventCallback<EventMap[K]>): void {
		const listeners = this.listeners.get(event);
		if (listeners) {
			listeners.delete(callback);
			if (listeners.size === 0) {
				this.listeners.delete(event);
			}
		}
	}

	/**
	 * Remove a once listener
	 */
	private offOnce<K extends EventKey>(event: K, callback: EventCallback<EventMap[K]>): void {
		const listeners = this.onceListeners.get(event);
		if (listeners) {
			listeners.delete(callback);
			if (listeners.size === 0) {
				this.onceListeners.delete(event);
			}
		}
	}

	/**
	 * Emit an event to all listeners
	 */
	emit<K extends EventKey>(event: K, data: EventMap[K]): void {
		// Regular listeners
		const listeners = this.listeners.get(event);
		if (listeners) {
			listeners.forEach(callback => {
				try {
					callback(data);
				} catch (error) {
					Logger.error(`Error in event listener for ${event}:`, error);
				}
			});
		}

		// Once listeners
		const onceListeners = this.onceListeners.get(event);
		if (onceListeners) {
			const listenersArray = Array.from(onceListeners);
			onceListeners.clear();
			this.onceListeners.delete(event);

			listenersArray.forEach(callback => {
				try {
					callback(data);
				} catch (error) {
					Logger.error(`Error in once event listener for ${event}:`, error);
				}
			});
		}
	}

	/**
	 * Remove all listeners for a specific event
	 */
	removeAllListeners<K extends EventKey>(event?: K): void {
		if (event) {
			this.listeners.delete(event);
			this.onceListeners.delete(event);
		} else {
			this.listeners.clear();
			this.onceListeners.clear();
		}
	}

	/**
	 * Get the number of listeners for an event
	 */
	listenerCount<K extends EventKey>(event: K): number {
		const regular = this.listeners.get(event)?.size || 0;
		const once = this.onceListeners.get(event)?.size || 0;
		return regular + once;
	}

	/**
	 * Check if there are any listeners for an event
	 */
	hasListeners<K extends EventKey>(event: K): boolean {
		return this.listenerCount(event) > 0;
	}

	/**
	 * Create a typed event emitter for a specific component
	 */
	createEmitter<K extends EventKey>(event: K) {
		return (data: EventMap[K]) => this.emit(event, data);
	}

	/**
	 * Create a promise that resolves when an event is emitted
	 */
	waitFor<K extends EventKey>(event: K, timeout?: number): Promise<EventMap[K]> {
		return new Promise((resolve, reject) => {
			let timeoutId: NodeJS.Timeout | null = null;

			const unsubscribe = this.once(event, (data) => {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				resolve(data);
			});

			if (timeout) {
				timeoutId = setTimeout(() => {
					unsubscribe();
					reject(new Error(`Event ${event} timeout after ${timeout}ms`));
				}, timeout);
			}
		});
	}

	/**
	 * Destroy the event manager and clean up all listeners
	 */
	destroy(): void {
		this.listeners.clear();
		this.onceListeners.clear();
	}
}

/**
 * Global event manager instance
 */
export const globalEventManager = new EventManager();

/**
 * Event delegation helper for DOM events
 */
export class DOMEventManager {
	private container: HTMLElement;
	private eventManager: EventManager;
	private domListeners = new Map<string, (event: Event) => void>();

	constructor(container: HTMLElement, eventManager?: EventManager) {
		this.container = container;
		this.eventManager = eventManager || new EventManager();
	}

	/**
	 * Add delegated event listener
	 */
	delegate<K extends keyof HTMLElementEventMap>(
		eventType: K,
		selector: string,
		handler: (event: HTMLElementEventMap[K], target: HTMLElement) => void
	): () => void {
		const delegatedHandler = (event: Event) => {
			const target = event.target as HTMLElement;
			const matchingElement = target.closest(selector) as HTMLElement;

			if (matchingElement && this.container.contains(matchingElement)) {
				handler(event as HTMLElementEventMap[K], matchingElement);
			}
		};

		const listenerKey = `${eventType}:${selector}`;
		this.domListeners.set(listenerKey, delegatedHandler);
		this.container.addEventListener(eventType, delegatedHandler);

		return () => {
			this.container.removeEventListener(eventType, delegatedHandler);
			this.domListeners.delete(listenerKey);
		};
	}

	/**
	 * Remove all DOM event listeners
	 */
	destroy(): void {
		this.domListeners.forEach((handler, key) => {
			const [eventType] = key.split(':');
			this.container.removeEventListener(eventType, handler);
		});
		this.domListeners.clear();
	}

	getEventManager(): EventManager {
		return this.eventManager;
	}
}

/**
 * Helper for common DOM event patterns
 */
export class CommonEventHandlers {
	/**
	 * Setup click handler with accessibility (Enter/Space key support)
	 */
	static setupClickHandler(
		element: HTMLElement,
		handler: (event: Event) => void,
		options: {
			stopPropagation?: boolean;
			preventDefault?: boolean;
			allowedKeys?: string[];
		} = {}
	): () => void {
		const {
			stopPropagation = false,
			preventDefault = false,
			allowedKeys = ['Enter', ' ']
		} = options;

		const clickHandler = (event: MouseEvent) => {
			if (stopPropagation) event.stopPropagation();
			if (preventDefault) event.preventDefault();
			handler(event);
		};

		const keyHandler = (event: KeyboardEvent) => {
			if (allowedKeys.includes(event.key)) {
				if (stopPropagation) event.stopPropagation();
				if (preventDefault) event.preventDefault();
				handler(event);
			}
		};

		element.addEventListener('click', clickHandler);
		element.addEventListener('keydown', keyHandler);

		return () => {
			element.removeEventListener('click', clickHandler);
			element.removeEventListener('keydown', keyHandler);
		};
	}

	/**
	 * Setup input debouncing using Obsidian's debounce with proper cleanup
	 */
	static setupDebouncedInput(
		element: HTMLInputElement,
		handler: (value: string) => void,
		delay: number = 300
	): () => void {
		let isDestroyed = false;
		const { debounce } = require('obsidian');

		const debouncedHandler = debounce((value: string) => {
			if (!isDestroyed) {
				handler(value);
			}
		}, delay);

		const inputHandler = () => {
			if (!isDestroyed) {
				debouncedHandler(element.value);
			}
		};

		element.addEventListener('input', inputHandler);

		// Return cleanup function
		return () => {
			isDestroyed = true;
			element.removeEventListener('input', inputHandler);
		};
	}

	/**
	 * Setup focus/blur state management
	 */
	static setupFocusState(
		element: HTMLElement,
		options: {
			focusClass?: string;
			onFocus?: () => void;
			onBlur?: () => void;
		} = {}
	): () => void {
		const { focusClass = 'focused', onFocus, onBlur } = options;

		const focusHandler = () => {
			element.addClass(focusClass);
			onFocus?.();
		};

		const blurHandler = () => {
			element.removeClass(focusClass);
			onBlur?.();
		};

		element.addEventListener('focus', focusHandler);
		element.addEventListener('blur', blurHandler);

		return () => {
			element.removeEventListener('focus', focusHandler);
			element.removeEventListener('blur', blurHandler);
		};
	}

	/**
	 * Setup hover state management
	 */
	static setupHoverState(
		element: HTMLElement,
		options: {
			hoverClass?: string;
			onEnter?: () => void;
			onLeave?: () => void;
		} = {}
	): () => void {
		const { hoverClass = 'hovered', onEnter, onLeave } = options;

		const mouseEnterHandler = () => {
			element.addClass(hoverClass);
			onEnter?.();
		};

		const mouseLeaveHandler = () => {
			element.removeClass(hoverClass);
			onLeave?.();
		};

		element.addEventListener('mouseenter', mouseEnterHandler);
		element.addEventListener('mouseleave', mouseLeaveHandler);

		return () => {
			element.removeEventListener('mouseenter', mouseEnterHandler);
			element.removeEventListener('mouseleave', mouseLeaveHandler);
		};
	}

	/**
	 * Setup loading state management for async operations
	 */
	static setupLoadingState(
		element: HTMLElement,
		options: {
			loadingClass?: string;
			disabledClass?: string;
		} = {}
	): {
		start: () => void;
		stop: () => void;
		cleanup: () => void;
	} {
		const { loadingClass = 'mod-loading', disabledClass = 'mod-disabled' } = options;
		let originalTabIndex: string | null = null;

		const start = () => {
			element.addClass(loadingClass);
			element.addClass(disabledClass);
			originalTabIndex = element.getAttribute('tabindex');
			element.setAttr('tabindex', '-1');
		};

		const stop = () => {
			element.removeClass(loadingClass);
			element.removeClass(disabledClass);
			if (originalTabIndex !== null) {
				element.setAttr('tabindex', originalTabIndex);
			} else {
				element.removeAttribute('tabindex');
			}
		};

		const cleanup = () => {
			stop();
		};

		return { start, stop, cleanup };
	}
}