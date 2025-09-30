import type CustomThemeStudioPlugin from '../main';

type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
	none: 0,
	error: 1,
	warn: 2,
	info: 3,
	debug: 4
};

export class Logger {
	private static plugin: CustomThemeStudioPlugin;

	/**
	 * Initialize the logger with the plugin instance
	 */
	static init(plugin: CustomThemeStudioPlugin): void {
		Logger.plugin = plugin;
	}

	/**
	 * Check if a log level should be output based on current settings
	 */
	private static shouldLog(level: LogLevel): boolean {
		if (!Logger.plugin) return false;

		const currentLevel = Logger.plugin.settings.debugLevel;
		return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[currentLevel];
	}

	/**
	 * Format the log message with timestamp and location
	 */
	private static formatMessage(level: string, message: string, location?: string): string {
		const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
		const locationStr = location ? ` [${location}]` : '';
		return `[CTS:${level}] ${timestamp}${locationStr} ${message}`;
	}

	/**
	 * Get the calling location (file:line)
	 */
	private static getLocation(): string {
		try {
			const stack = new Error().stack;
			if (!stack) return '';

			// Parse the stack trace to get caller info (skip Logger methods)
			const lines = stack.split('\n');
			// Skip: Error, getLocation, the logger method (debug/info/etc), and get the actual caller
			const callerLine = lines[4];
			if (!callerLine) return '';

			// Extract file:line from stack trace
			const match = callerLine.match(/at\s+(?:.*\s+)?\(?(.+):(\d+):\d+\)?/);
			if (match) {
				const fullPath = match[1];
				const line = match[2];
				// Get just the filename from the full path
				const filename = fullPath.split('/').pop() || fullPath;
				return `${filename}:${line}`;
			}
		} catch (e) {
			// Silently fail if stack trace parsing fails
		}
		return '';
	}

	/**
	 * Log a debug message (most verbose)
	 */
	static debug(message: string, data?: any): void {
		if (!Logger.shouldLog('debug')) return;

		const location = Logger.getLocation();
		const formattedMessage = Logger.formatMessage('Debug', message, location);

		if (data !== undefined) {
			console.log(formattedMessage, data);
		} else {
			console.log(formattedMessage);
		}
	}

	/**
	 * Log an info message
	 */
	static info(message: string, data?: any): void {
		if (!Logger.shouldLog('info')) return;

		const location = Logger.getLocation();
		const formattedMessage = Logger.formatMessage('Info', message, location);

		if (data !== undefined) {
			console.info(formattedMessage, data);
		} else {
			console.info(formattedMessage);
		}
	}

	/**
	 * Log a warning message
	 */
	static warn(message: string, data?: any): void {
		if (!Logger.shouldLog('warn')) return;

		const location = Logger.getLocation();
		const formattedMessage = Logger.formatMessage('Warn', message, location);

		if (data !== undefined) {
			console.warn(formattedMessage, data);
		} else {
			console.warn(formattedMessage);
		}
	}

	/**
	 * Log an error message
	 */
	static error(message: string, data?: any): void {
		if (!Logger.shouldLog('error')) return;

		const location = Logger.getLocation();
		const formattedMessage = Logger.formatMessage('Error', message, location);

		if (data !== undefined) {
			console.error(formattedMessage, data);
		} else {
			console.error(formattedMessage);
		}
	}
}