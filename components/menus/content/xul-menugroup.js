/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

{
	class MozMenuGroup extends MozXULElement {
		/**
		 * The menu group's tooltip element
		 */
		get groupTooltip() {
			return /** @type {BrowserTooltip} */ (
				this.querySelector("tooltip") ||
					document.createXULElement("tooltip", {
						is: "browser-tooltip"
					})
			);
		}

		/**
		 * The current active menuitem
		 * @type {ReturnType<typeof MozMenuItemBaseMixin<Constructor<XULElement>>>["prototype"]}
		 */
		get activeItem() {
			return this.querySelector("[_moz-menuactive='true']");
		}

		/**
		 * Updates the menugroup's tooltip text
		 */
		_updateTooltipText() {
			if (this.groupTooltip.state == "closed") return;

			if (this.activeItem) {
				this.groupTooltip.label = this.activeItem.label;
			}
		}

		connectedCallback() {
			this.setAttribute("tooltip", "_child");

			this.prepend(this.groupTooltip);

			this.groupTooltip.addEventListener(
				"popupshowing",
				this._updateTooltipText.bind(this)
			);
		}
	}

	customElements.define("menugroup", MozMenuGroup);
}
