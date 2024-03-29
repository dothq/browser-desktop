/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

{
	Services.scriptloader.loadSubScript(
		"chrome://dot/content/widgets/xul-menu-base.js"
	);

	class MozMenuItem extends MozMenuItemBaseMixin(MozXULElement) {}
	customElements.define("menuitem", MozMenuItem);

	class MozMenuCaption extends MozMenuItemBaseMixin(MozXULElement) {}
	customElements.define("menucaption", MozMenuCaption);
}
