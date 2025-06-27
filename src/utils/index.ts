import { Notice, setIcon } from 'obsidian';

// https://github.com/chrisgrieser/obsidian-theme-design-utilities/blob/main/src/main.ts#L4
// https://www.electronjs.org/docs/latest/api/web-contents#contentsopendevtoolsoptions
declare const electronWindow: {
	openDevTools: () => void;
	toggleDevTools: () => void;
};

export function copyStringToClipboard(text: string, topic: string | undefined = undefined): void {
	navigator.clipboard
		.writeText(text)
		.then(function () {
			showNotice('"' + (topic !== undefined ? topic + '"' : 'Text') + ' copied to clipboard', 2500, 'success');
		})
		.catch(function (error) {
			console.error('Failed to copy to clipboard: ', error)
		})
}

function showNotice(message: string, duration: number = 4000, type: string | undefined): void {

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
				style: `color: var(--color-blue);`,
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

export function getCurrentTheme() {
	// @ts-ignore
	let currentTheme: string = this.app.getTheme() === 'obsidian' ? 'obsidian' : 'moonstone';
	return currentTheme;
}

export function generateUniqueId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    	return String(crypto.randomUUID());
    }
	// Fallback
	const timestamp = Date.now()
	const randomNum = Math.floor(Math.random() * 10000)
	return `cts-${timestamp}-${randomNum}`
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
		// biome-ignore lint/suspicious/noDebugger: actual feature
		debugger;
		clearInterval(timer);
	}, delay * 1000);
}