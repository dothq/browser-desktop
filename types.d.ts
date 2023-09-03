/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { nsBrowserAccess } from "components/DotBrowserWindow.sys.mjs";
import "./mozbuild";
import "./third_party/dothq/gecko-types";
import * as Gecko from "./third_party/dothq/gecko-types/lib";

type MozXULElement = {
	prototype: Gecko.MozXULElement;
	new (): Gecko.MozXULElement;
} & Gecko.MozElementMixinStatic;

type MozHTMLElement = {
	prototype: Gecko.MozHTMLElement;
	new (): Gecko.MozHTMLElement;
} & Gecko.MozElementMixinStatic;

declare global {
	/* Only available in secure contexts */
	interface Screen {
		availTop: number;
		availLeft: number;
	}

	var BrowserUIUtils: Gecko.BrowserUIUtils;
	var gDot: typeof _gDot;
	var gDotInit: typeof gDotInit;
	var XULBrowserWindow: nsIXULBrowserWindow;
	var browserDOMWindow: nsBrowserAccess;

	var XULElement: Gecko.XULElement;
	var XULFrameElement: XULElement;
	var XULMenuElement: XULElement;
	var XULPopupElement: XULElement;
	var XULResizerElement: XULElement;
	var XULTextElement: XULElement;
	var XULTreeElement: XULElement;

	var MozXULElement: MozXULElement;
	var MozHTMLElement: MozHTMLElement;

	var MozElements: Gecko.MozElements;

	var BrowsingContext: Gecko.BrowsingContextGlobal;

	var WebExtensionPolicy: Gecko.WebExtensionPolicy;

	var Localization: Gecko.Localization;

	/**
	 * browser-compat is used as a compatibility layer to translate Dot APIs to the original FF/Gecko APIs
	 *
	 * When building Dot Browser, we eventually need to use existing code built by Mozilla, and we don't really
	 * want to move code into the Dot tree that could easily be changed upstream.
	 *
	 * For this reason, it's easier for us to create a compatibility layer between our APIs and the Mozilla APIs,
	 * to avoid breaking these important scripts.
	 *
	 * @deprecated You shouldn't use this in Dot code directly! This is purely intended for use by existing Mozilla modules and scripts to maintain compatibility.
	 */
	var gBrowser: typeof gBrowser;

	interface Window {
		html: (
			tagName: string,
			attributes?: { [key: string]: string | boolean | number },
			...children: Array<HTMLElement | string>
		) => HTMLElement;
		arguments: any;
		CSS: typeof CSS;
		openDialog: (
			url?: string,
			target?: string,
			features?: string,
			...extraArguments: any[]
		) => Window;
		MozXULElement: MozXULElement;
		MozHTMLElement: MozHTMLElement;
		gDot: typeof _gDot;
		minimize(): void;
		maximize(): void;
		restore(): void;
		fullScreen: boolean;
		STATE_MAXIMIZED: 1;
		STATE_MINIMIZED: 2;
		STATE_NORMAL: 3;
		STATE_FULLSCREEN: 4;
		windowState: number;
		gDotInit: typeof gDotInit;
		gDotCommands: typeof gDotCommands;
		mozInnerScreenX: number;
		mozInnerScreenY: number;
		windowRoot: Gecko.WindowRoot;
	}

	interface Document {
		l10n: Gecko.LocalizationInstance;
	}
}
