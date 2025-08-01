import { App, Modal } from 'obsidian';

type PromiseVal<T = void> = T | PromiseLike<T>;

class ConfirmModal extends Modal {
    buttonContainerEl = this.modalEl.createDiv('modal-button-container');
    private resolve: ((value: PromiseVal<boolean>) => void) | null = null;
    constructor(app: App) {
        super(app);
        this.containerEl.addClass('mod-confirmation');
        this.containerEl.addClass('snippet-import-confirmation');
        this.addCancelButton();
        this.addButton('', 'OK', () => this.resolve && this.resolve(true));
    }
    open(): Promise<boolean> {
        super.open();
        return new Promise((resolve) => (this.resolve = resolve));
    }
    addButton(
        cls: string | string[],
        text: string,
        callback?: (evt: MouseEvent) => any,
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
            .addEventListener('click', async (evt) => {
                callback && (await callback(evt));
                this.close();
            });
        return this;
    }
    onClose() {
        this.resolve && this.resolve(false);
    }

    addCancelButton() {
        this.addButton('confirm-modal-cancel-button', 'Cancel', this.close.bind(this));
    }
}

export const confirm = (message: string | DocumentFragment, app: App) => {
    const modal = new ConfirmModal(app);
    modal.contentEl.setText(message);
    return modal.open();
};