import { Notice, setIcon } from 'obsidian';

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