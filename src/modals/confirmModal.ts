import { App, Modal } from 'obsidian';

class ConfirmModal extends Modal {
    buttonContainerEl = this.modalEl.createDiv('modal-button-container');
    private resolve: ((value: boolean) => void) | null = null;
    private openPromise: Promise<boolean> | null = null;
    constructor(app: App) {
        super(app);
        this.containerEl.addClass('mod-confirmation');
        this.containerEl.addClass('snippet-import-confirmation');
        this.addCancelButton();
        this.addButton('', 'OK', () => {
            if (this.resolve) {
                this.resolve(true);
            }
        });
    }
    open(): void {
        super.open();
        this.openPromise = new Promise((resolve) => {
            this.resolve = resolve;
        });
    }
    waitForResult(): Promise<boolean> {
        return this.openPromise ?? Promise.resolve(false);
    }
    addButton(
        cls: string | string[],
        text: string,
        callback?: (evt: MouseEvent) => unknown,
    ) {
        this.buttonContainerEl
            .createEl(
                'button',
                {
                    cls,
                    text,
                    attr: {
                        'tabindex': 0
                    }
                }
            )
            .addEventListener('click', (evt) => {
                if (callback) {
                    void Promise.resolve(callback(evt)).then(() => this.close());
                } else {
                    this.close();
                }
            });
        return this;
    }
    onClose() {
        if (this.resolve) {
            this.resolve(false);
        }
    }

    addCancelButton() {
        this.addButton('confirm-modal-cancel-button', 'Cancel', () => this.close());
    }
}

export const confirm = (message: string | DocumentFragment, app: App): Promise<boolean> => {
    const modal = new ConfirmModal(app);
    modal.contentEl.setText(message);
    modal.open();
    return modal.waitForResult();
};