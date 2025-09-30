/**
 * Application-wide constants
 */

/**
 * Debounce delays in milliseconds
 */
export const DEBOUNCE_DELAYS = {
	/** Delay for variable value updates */
	VARIABLE_UPDATE: 1000,
	/** Delay for CSS editor change events */
	CSS_EDITOR_CHANGE: 500,
	/** Delay for search input changes */
	SEARCH_INPUT: 300,
} as const;

/**
 * Timeout delays in milliseconds
 */
export const TIMEOUT_DELAYS = {
	/** Delay before scrolling to element */
	SCROLL_DELAY: 100,
	/** Delay for element selection initialization */
	ELEMENT_SELECTION: 300,
} as const;

/**
 * Notice durations in milliseconds
 */
export const NOTICE_DURATIONS = {
	/** Standard notice duration */
	STANDARD: 5000,
	/** Long notice duration for important messages */
	LONG: 10000,
} as const;
