/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

{
	class MozMenuGroup extends MozXULElement {
		constructor() {
			super();

			this.mutationObserver = new MutationObserver(
				this._onObserveMutation.bind(this)
			);
		}

		/**
		 * The menugroup's menuitems
		 * @type {ReturnType<typeof MozMenuItemBaseMixin<Constructor<XULElement>>>["prototype"][]}
		 */
		get items() {
			return Array.from(
				/** @type {any} */ (this.querySelectorAll("menuitem"))
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
		 * Fires whenever a mutation occurs within the menugroup
		 */
		_onObserveMutation() {
			for (const item of this.items) {
				item.setAttribute("in-group", "");
			}
		}

		connectedCallback() {
			this.mutationObserver.observe(this, {
				subtree: true,
				childList: true
			});
		}
	}

	customElements.define("menugroup", MozMenuGroup);
}
