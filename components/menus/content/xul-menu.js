/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(() => {
	Services.scriptloader.loadSubScript("chrome://dot/content/html.js", this);

	Services.scriptloader.loadSubScript(
		"chrome://dot/content/widgets/browser-contextual-element.js",
		this
	);

	Services.scriptloader.loadSubScript(
		"chrome://dot/content/widgets/browser-customizable-context.js",
		this
	);

	Services.scriptloader.loadSubScript(
		"chrome://dot/content/widgets/browser-command-element.js"
	);

	Services.scriptloader.loadSubScript(
		"chrome://dot/content/widgets/xul-menu-base.js",
		this
	);

	Services.scriptloader.loadSubScript(
		"chrome://dot/content/widgets/xul-menuitem.js",
		this
	);

	class MozMenu extends MozMenuBaseMixin(
		MozElements.MozElementMixin(XULMenuElement)
	) {
		connectedCallback() {
			if (this.delayConnectedCallback()) {
				return;
			}

			if (this.renderedOnce) {
				return;
			}

			this.renderedOnce = true;

			super.connectedCallback();
		}
	}

	customElements.define("menu", MozMenu);
})();
