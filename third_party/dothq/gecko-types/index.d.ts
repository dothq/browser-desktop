/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* 
    Based on the following Gecko API sources:
    * mozilla-central/devtools/client/performance-new/@types/gecko.d.ts
*/

import * as Gecko from "./lib";

declare const chrome: {
	Cc: Gecko.Cc;
	Ci: Gecko.Ci;
	Cu: Gecko.Cu;
	Services: Gecko.Services;
};

interface PathUtilsInterface {
	split: (path: string) => string[];
	isAbsolute: (path: string) => boolean;
}

declare global {
	var ChromeUtils: Gecko.ChromeUtils;

	var Marionette: Gecko.Marionette;
	var RemoteAgent: Gecko.RemoteAgent;

	// These global objects can be used directly in JSM files only.
	// In a CommonJS context you need to import them with `require("chrome")`.
	var Cu: Gecko.Cu;
	var Cc: Gecko.Cc;
	var Ci: Gecko.Ci;
	var Cr: Gecko.Cr;
	var Services: Gecko.Services;

	var Components: Gecko.Components;

	// Global actor modules
	class JSWindowActorParent extends Gecko.JSWindowActorParent {}
	class JSWindowActorChild extends Gecko.JSWindowActorChild {}

	interface Document {
		/**
		 * Create a XUL element of a specific type. Right now this function
		 * only refines iframes, but more tags could be added.
		 */
		createXULElement: ((type: "iframe", options?: ElementCreationOptions) => XULIframeElement) &
			((type: "browser", options?: ElementCreationOptions) => Gecko.ChromeBrowser) &
            ((type: "menupopup", options?: ElementCreationOptions) => Gecko.XULPopupElement) &
			((type: string, options?: ElementCreationOptions) => XULElement);

		/**
		 * Determines whether we have had a valid user gesture activation
		 */
		hasValidTransientUserGestureActivation: boolean;

		nodePrincipal: any;

        ownerGlobal: Window;

        createEvent(eventInterface: "xulcommandevent"): XULCommandEvent;
	}

	/**
	 * This is a variant on the HTMLElement, as it contains chrome-specific properties.
	 */
	interface ChromeHTMLElement extends HTMLElement {
		ownerDocument: Document;
	}

	interface XULElement extends HTMLElement {
		ownerDocument: Document;
	}

	interface XULIframeElement extends XULElement {
		contentWindow: ChromeWindow;
		src: string;
	}

	interface ChromeWindow extends Window {
		openWebLinkIn: (
			url: string,
			where: "current" | "tab" | "tabshifted" | "window" | "save",
			// TS-TODO
			params?: unknown,
		) => void;
		openTrustedLinkIn: (
			url: string,
			where: "current" | "tab" | "tabshifted" | "window" | "save",
			// TS-TODO
			params?: unknown,
		) => void;
		isChromeWindow: boolean;
	}

	class ChromeWorker extends Worker {}

	interface MenuListElement extends XULElement {
		value: string;
		disabled: boolean;
	}

	interface XULCommandEvent extends KeyboardEvent {
		target: XULElement;

        initCommandEvent: (
            type: string,
            canBubble: boolean,
            cancelable: boolean,
            view: Window,
            detail: number,
            ctrlKey: boolean,
            altKey: boolean,
            shiftKey: boolean,
            metaKey: boolean,
            button: number,
            sourceEvent: Event,
            inputSource: number
        ) => void;
	}

	interface XULElementWithCommandHandler {
		addEventListener: (
			type: "command",
			handler: (event: XULCommandEvent) => void,
			isCapture?: boolean,
		) => void;
		removeEventListener: (
			type: "command",
			handler: (event: XULCommandEvent) => void,
			isCapture?: boolean,
		) => void;
	}

	type nsIPrefBranch = Gecko.nsIPrefBranch;

	interface Window {
		docShell: Gecko.nsIDocShell;
		InspectorUtils: Gecko.InspectorUtils;
		windowGlobalChild: Gecko.WindowGlobalChildInstance;
		windowUtils: Gecko.WindowUtils;
	}

	interface Element extends Gecko.CustomElement {
		ownerGlobal: ChromeWindow;
	}

	interface CustomElementRegistry {
		setElementCreationCallback(name: string, callback: () => void): void;
	}
}
