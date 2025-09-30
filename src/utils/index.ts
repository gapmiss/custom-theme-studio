import { Notice, setIcon, App } from 'obsidian';

export { Logger } from './Logger';

// https://github.com/chrisgrieser/obsidian-theme-design-utilities/blob/main/src/main.ts#L4
// https://www.electronjs.org/docs/latest/api/web-contents#contentsopendevtoolsoptions
declare const electronWindow: {
	openDevTools: () => void;
	toggleDevTools: () => void;
};

// Copy given string to clipboard
export function copyStringToClipboard(text: string, topic: string | undefined = undefined): void {
	navigator.clipboard
		.writeText(text)
		.then(function () {
			showNotice('"' + (topic !== undefined ? topic + '"' : 'Text') + ' copied to clipboard', 5000, 'success');
		})
		.catch(function (error) {
			Logger.error('Failed to copy to clipboard: ', error)
		});
}

// Show Notice with type & icon
export function showNotice(message: string, duration: number = 4000, type: string | undefined): void {

	const fragment: DocumentFragment = document.createDocumentFragment();

	let wrapper: HTMLDivElement = fragment.createDiv({
		attr: {
			style: `display: flex; gap: .75em;`,
		}
	});

	if (type === 'error') {
		const header: HTMLDivElement = wrapper.createDiv({
			attr: {
				style: `color: var(--color-red);`,
			},
		});
		setIcon(header, 'alert-triangle');
	}

	if (type === 'warning') {
		const header: HTMLDivElement = wrapper.createDiv({
			attr: {
				style: `color: var(--color-yellow);`,
			},
		});
		setIcon(header, 'alert-triangle');
	}

	if (type === 'success') {
		const header: HTMLDivElement = wrapper.createDiv({
			attr: {
				style: `color: var(--color-green);`,
			},
		});
		setIcon(header, 'check-circle');
	}

	if (type === 'info') {
		const header: HTMLDivElement = wrapper.createDiv({
			attr: {
				// style: `color: var(--color-blue);`,
			},
		});
		setIcon(header, 'info');
	}

	wrapper.createDiv({
		text: message,
		attr: {
			style: ``,
		},
	});

	new Notice(fragment, duration);
}

export function getCurrentTheme(app: App): string {
	return app.getTheme() === 'obsidian' ? 'obsidian' : 'moonstone';
}

// https://github.com/Yuichi-Aragi/Version-Control/blob/main/src/utils/id.ts
export function generateUniqueId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return String(crypto.randomUUID());
	}
	// Fallback for environments without crypto.randomUUID (e.g., older Node.js in some test runners, or very old browsers)
	// This is a standard RFC4122 version 4 UUID.
	let d = new Date().getTime(); //Timestamp
	let d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		let r = Math.random() * 16; //random number between 0 and 16
		if (d > 0) { //Use timestamp until depleted
			r = (d + r) % 16 | 0;
			d = Math.floor(d / 16);
		} else { //Use microseconds since page-load if supported
			r = (d2 + r) % 16 | 0;
			d2 = Math.floor(d2 / 16);
		}
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

// https://github.com/chrisgrieser/obsidian-theme-design-utilities/blob/main/src/main.ts#L128
export function freezeTimer(delay: number): void {
	const freezeNotice = new Notice(`⚠ Will freeze Obsidian in ${delay}s`, (delay - 0.2) * 1000);
	electronWindow.openDevTools(); // devtools open needed for the debugger to work

	let passSecs = 0;
	const timer = setInterval(() => {
		const timePassed = (delay - passSecs).toFixed(1);
		freezeNotice.setMessage(`⚠ Will freeze Obsidian in ${timePassed}s`);
		passSecs += 0.1;
	}, 100);

	setTimeout(() => {
		debugger;
		clearInterval(timer);
	}, delay * 1000);
}