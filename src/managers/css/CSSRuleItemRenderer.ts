import { setIcon } from 'obsidian';
import CustomThemeStudioPlugin from '../../main';
import { CustomThemeStudioView } from '../../views/customThemeStudioView';
import { CSSrule } from '../../settings';
import { AceService } from '../../ace/AceService';
import { confirm } from '../../modals/confirmModal';
import { showNotice } from '../../utils';
import { TIMEOUT_DELAYS } from '../../constants';

export interface CSSRuleItemConfig {
	plugin: CustomThemeStudioPlugin;
	view: CustomThemeStudioView;
	aceService: AceService;
	onEdit: (rule: CSSrule, item: HTMLElement) => void;
	onToggle: (rule: CSSrule, button: HTMLElement) => Promise<void>;
	onDelete: (rule: CSSrule, item: HTMLElement) => Promise<void>;
}

/**
 * Renders individual CSS rule items in the DOM.
 * Handles creation of rule item structure and button event handlers.
 */
export class CSSRuleItemRenderer {
	private config: CSSRuleItemConfig;

	constructor(config: CSSRuleItemConfig) {
		this.config = config;
	}

	/**
	 * Creates a complete rule item DOM element with buttons and event handlers
	 */
	createRuleItem(containerEl: HTMLElement, rule: CSSrule): HTMLElement {
		const item = containerEl.createDiv({
			cls: 'rule-item',
			attr: {
				'data-cts-uuid': rule.uuid,
				'data-tooltip-position': 'top'
			}
		});

		const ruleHeader = item.createDiv('rule-item-header');
		this.createTitle(ruleHeader, rule);
		this.createActions(ruleHeader, rule, item);

		return item;
	}

	/**
	 * Updates the content of an existing rule item without re-creating it
	 */
	updateRuleItemContent(item: HTMLElement, rule: CSSrule): void {
		// Update UUID attribute
		item.setAttr('data-cts-uuid', rule.uuid);

		// Update title text
		const titleEl = item.querySelector('.rule-item-title div');
		if (titleEl) {
			titleEl.textContent = rule.rule;
		}

		// Update enabled button state
		const enabledButton = item.querySelector('.rule-item-actions button:nth-child(2)') as HTMLElement;
		if (enabledButton) {
			if (rule.enabled) {
				setIcon(enabledButton, 'eye');
				enabledButton.setAttr('aria-label', 'Disable this rule');
			} else {
				setIcon(enabledButton, 'eye-off');
				enabledButton.setAttr('aria-label', 'Enable this rule');
			}
		}
	}

	private createTitle(ruleHeader: HTMLElement, rule: CSSrule): void {
		const titleEl = ruleHeader.createDiv('rule-item-title');
		titleEl.createDiv({ text: rule.rule });
	}

	private createActions(ruleHeader: HTMLElement, rule: CSSrule, item: HTMLElement): void {
		const actionsEl = ruleHeader.createDiv('rule-item-actions');

		this.createEditButton(actionsEl, rule, item);
		this.createEnabledButton(actionsEl, rule, item);
		this.createDeleteButton(actionsEl, rule, item);
	}

	private createEditButton(actionsEl: HTMLElement, rule: CSSrule, item: HTMLElement): void {
		const editButton = actionsEl.createEl('button', { cls: 'clickable-icon' });
		editButton.setAttr('aria-label', 'Edit this rule');
		editButton.setAttr('data-tooltip-position', 'top');
		editButton.setAttr('tabindex', '0');
		setIcon(editButton, 'edit');

		editButton.addEventListener('click', async () => {
			// Check if editor section is already visible
			const editorSection = this.config.view.containerEl.querySelector('.css-editor-section');
			const isEditorVisible = editorSection && getComputedStyle(editorSection).display !== 'none';

			if (isEditorVisible && this.config.plugin.settings.showConfirmation) {
				if (!await confirm('You have an unsaved CSS rule form open. Editing another rule will discard your changes. Continue?', this.config.plugin.app)) {
					return;
				}
			}

			// Get fresh data from settings to avoid stale closure
			const uuid = item.getAttribute('data-cts-uuid')!;
			const freshRule = this.config.plugin.settings.cssRules.find(r => r.uuid === uuid);
			if (freshRule) {
				this.config.onEdit(freshRule, item);
			}
		});
	}

	private createEnabledButton(actionsEl: HTMLElement, rule: CSSrule, item: HTMLElement): void {
		const enabledButton = actionsEl.createEl('button', { cls: 'clickable-icon' });
		enabledButton.setAttr('data-tooltip-position', 'top');
		enabledButton.setAttr('tabindex', '0');

		if (rule.enabled) {
			setIcon(enabledButton, 'eye');
			enabledButton.setAttr('aria-label', 'Disable this rule');
		} else {
			setIcon(enabledButton, 'eye-off');
			enabledButton.setAttr('aria-label', 'Enable this rule');
		}

		enabledButton.addEventListener('click', async () => {
			// Get fresh data from settings to avoid stale closure
			const uuid = item.getAttribute('data-cts-uuid')!;
			const freshRule = this.config.plugin.settings.cssRules.find(r => r.uuid === uuid);
			if (freshRule) {
				await this.config.onToggle(freshRule, enabledButton);
			}
		});
	}

	private createDeleteButton(actionsEl: HTMLElement, rule: CSSrule, item: HTMLElement): void {
		const deleteButton = actionsEl.createEl('button', {
			cls: 'rule-item-delete-button clickable-icon mod-destructive'
		});
		deleteButton.setAttr('aria-label', 'Delete this rule');
		deleteButton.setAttr('data-tooltip-position', 'top');
		deleteButton.setAttr('tabindex', '0');
		setIcon(deleteButton, 'trash');

		deleteButton.addEventListener('click', async () => {
			deleteButton.addClass('mod-loading');

			// Get fresh data from settings to avoid stale closure
			const uuid = item.getAttribute('data-cts-uuid')!;
			const freshRule = this.config.plugin.settings.cssRules.find(r => r.uuid === uuid);

			if (freshRule && await confirm(`Are you sure you want to delete the rule "${freshRule.rule}"?`, this.config.plugin.app)) {
				await this.config.onDelete(freshRule, item);
				showNotice('CSS rule deleted', 5000, 'success');
			}

			deleteButton.removeClass('mod-loading');
		});
	}
}
