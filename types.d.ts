/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIXULBrowserWindow } from "./base/content/browser-window";
import { DotCustomizableUI } from "./components/customizableui/CustomizableUI";
import "./third_party/dothq/gecko-types";
import * as Gecko from "./third_party/dothq/gecko-types/lib";

declare module "resource://app/modules/DevToolsServer.sys.mjs" {}

declare global {
	/* Only available in secure contexts */
	interface Screen {
		availTop: number;
		availLeft: number;
	}

	var BrowserUIUtils: Gecko.BrowserUIUtils;
	var gBrowser: Gecko.Browser;
	var XULBrowserWindow: nsIXULBrowserWindow;

	var XULElement: Gecko.XULElement;

	interface Window {
		setToolbarVisibility: any;
		updateFxaToolbarMenu: any;
		SidebarUI: any;
		LightweightThemeConsumer: any;
		CustomizableUI: typeof DotCustomizableUI;
		DotCustomizableUI: typeof DotCustomizableUI;
		html: (
			tagName: string,
			attributes?: { [key: string]: any },
			...children: Array<HTMLElement | string>
		) => HTMLElement;
	}
}
