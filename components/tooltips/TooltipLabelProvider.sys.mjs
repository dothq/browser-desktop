/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const tooltipL10n = new Localization(["dot/tooltips.ftl"], true);

export const TooltipLabelProvider = {
	/**
	 * Constructs the tooltip text using the supplied values
	 * @param {string} label
	 * @param {object} [options]
	 * @param {string} [options.sublabel]
	 * @param {string} [options.shortcut]
	 */
	getTooltipText(label, options) {
		let tooltipText = [];

		if (options && options.shortcut) {
			tooltipText.push(
				tooltipL10n.formatValueSync("tooltip-shortcut-label", {
					label,
					shortcut: options.shortcut
				})
			);
		} else {
			tooltipText.push(
				tooltipL10n.formatValueSync("tooltip-label", {
					label
				})
			);
		}

		if (options && options.sublabel) {
			tooltipText.push(
				tooltipL10n.formatValueSync("tooltip-label", {
					label: options.sublabel
				})
			);
		}

		return tooltipText.join("\n");
	}
};
