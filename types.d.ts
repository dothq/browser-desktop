/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { _dBrowser } from "./base/content/browser";
import { nsIXULBrowserWindow } from "./base/content/browser-window";
import "./third_party/dothq/gecko-types";
import * as Gecko from "./third_party/dothq/gecko-types/lib";
import "./mozbuild";

declare global {
	/* Only available in secure contexts */
	interface Screen {
		availTop: number;
		availLeft: number;
	}

	var BrowserUIUtils: Gecko.BrowserUIUtils;
	var gBrowser: typeof _dBrowser & Gecko.Browser;
	var _gBrowser: Gecko.Browser;
	var XULBrowserWindow: nsIXULBrowserWindow;

	var XULElement: Gecko.XULElement;

	interface Window {
		setToolbarVisibility: any;
		updateFxaToolbarMenu: any;
		SidebarUI: any;
		LightweightThemeConsumer: any;
		html: (
			tagName: string,
			attributes?: { [key: string]: any },
			...children: Array<HTMLElement | string>
		) => HTMLElement;
		arguments: any;
		CSS: typeof CSS;
		openDialog: (
			url?: string,
			target?: string,
			features?: string,
			...extraArguments: any[]
		) => void;
	}
}
