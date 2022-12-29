/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

interface MozHTMLElement extends HTMLElement {}

declare var MozHTMLElement: {
	prototype: MozHTMLElement;
	new (): MozHTMLElement;
};

declare function html(
	tagName: string,
	attributes?: { [key: string]: any },
	...children: Array<HTMLElement | string>
): HTMLElement;

declare var gBrowserInit: any;
declare var WindowIsClosing: any;
declare var StatusPanel: any;
declare var LinkTargetDisplay: any;
