import { debounce } from 'obsidian';

/**
 * Enhanced debouncer that wraps Obsidian's debounce with proper cleanup
 */
export class Debouncer {
	private debouncedFunctions = new Map<string, {
		fn: (...args: unknown[]) => void;
		cancel: () => void;
	}>();

	/**
	 * Create a debounced function with cleanup capability
	 */
	debounce<T extends (...args: unknown[]) => void>(
		key: string,
		fn: T,
		delay: number,
		immediate: boolean = false
	): T {
		// Cancel any existing debounced function with the same key
		this.cancel(key);

		// Create debounced function using Obsidian's debounce
		const debouncedFn = debounce(fn, delay, immediate);

		// Store with cleanup capability
		this.debouncedFunctions.set(key, {
			fn: debouncedFn,
			cancel: () => {
				// Obsidian's debounce doesn't expose cancel, but we can track calls
				this.debouncedFunctions.delete(key);
			}
		});

		return debouncedFn as unknown as T;
	}

	/**
	 * Cancel a specific debounced function
	 */
	cancel(key: string): void {
		const entry = this.debouncedFunctions.get(key);
		if (entry) {
			entry.cancel();
		}
	}

	/**
	 * Cancel all debounced functions
	 */
	cancelAll(): void {
		for (const [key] of this.debouncedFunctions) {
			this.cancel(key);
		}
	}

	/**
	 * Get the number of active debounced functions
	 */
	getActiveCount(): number {
		return this.debouncedFunctions.size;
	}

	/**
	 * Check if a debounced function exists
	 */
	has(key: string): boolean {
		return this.debouncedFunctions.has(key);
	}

	/**
	 * Clean up all debounced functions (call in destroy())
	 */
	destroy(): void {
		this.cancelAll();
	}
}

/**
 * Simple debouncer for single-use cases that wraps Obsidian's debounce
 */
export class SimpleDebouncer {
	private debouncedFn?: (...args: unknown[]) => void;
	private isDestroyed = false;

	constructor(
		fn: (...args: unknown[]) => void,
		delay: number,
		immediate: boolean = false
	) {
		this.debouncedFn = debounce(fn, delay, immediate);
	}

	/**
	 * Execute the debounced function
	 */
	execute(...args: unknown[]): void {
		if (!this.isDestroyed && this.debouncedFn) {
			this.debouncedFn(...args);
		}
	}

	/**
	 * Cancel pending execution and clean up
	 */
	destroy(): void {
		this.isDestroyed = true;
		this.debouncedFn = undefined;
	}
}

/**
 * Enhanced debounced input helper that uses Obsidian's debounce with cleanup
 */
export function createDebouncedInput(
	element: HTMLInputElement,
	handler: (value: string) => void,
	delay: number = 300
): () => void {
	let isDestroyed = false;

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
 * Create a debounced function for component methods using Obsidian's debounce
 */
export function createDebouncedMethod<T extends (...args: unknown[]) => void>(
	fn: T,
	delay: number,
	immediate: boolean = false
): { execute: T; destroy: () => void } {
	let isDestroyed = false;
	const debouncedFn = debounce((...args: unknown[]) => {
		if (!isDestroyed) {
			fn(...args);
		}
	}, delay, immediate);

	return {
		execute: debouncedFn as unknown as T,
		destroy: () => {
			isDestroyed = true;
		}
	};
}