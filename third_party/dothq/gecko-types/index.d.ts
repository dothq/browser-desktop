/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* 
    Based on the following Gecko API sources:
    * mozilla-central/devtools/client/performance-new/@types/gecko.d.ts
*/

import * as Gecko from "./lib";
import { nsIDocShell } from "./lib";

export interface Cc {
	"@mozilla.org/process/environment;1": {
		getService(service: Gecko.nsIEnvironment): Gecko.Environment;
	};
	"@mozilla.org/filepicker;1": {
		createInstance(
			instance: Gecko.nsIFilePicker
		): Gecko.FilePicker;
	};
}

export interface Ci {
	nsIAppWindow: Gecko.nsIAppWindow;
	nsIChannel: Gecko.nsIChannel;
	nsIDocShell: Gecko.nsIDocShell;
	nsIDragService: Gecko.nsIDragService;
	nsIEnvironment: Gecko.nsIEnvironment;
	nsIFilePicker: Gecko.nsIFilePicker;
	nsIInterfaceRequestor: Gecko.nsIInterfaceRequestor;
	nsILoadContext: Gecko.nsILoadContext;
	nsIPrefBranch: Gecko.nsIPrefBranch;
	nsIRequest: Gecko.nsIRequest;
	nsIURI: Gecko.nsIURI;
	nsIWebProgress: Gecko.nsIWebProgress;
	nsIWebProgressListener: Gecko.nsIWebProgressListener;
	nsIXULBrowserWindow: Gecko.nsIXULBrowserWindow;
}

declare const chrome: {
	Cc: Cc;
	Ci: Ci;
	Cu: typeof Cu;
	Services: Gecko.Services;
};

interface PathUtilsInterface {
	split: (path: string) => string[];
	isAbsolute: (path: string) => boolean;
}

declare global {
	var ChromeUtils: Gecko.ChromeUtils;
	var XPCOMUtils: Gecko.XPCOMUtils;

	var PathUtils: PathUtilsInterface;

	// These global objects can be used directly in JSM files only.
	// In a CommonJS context you need to import them with `require("chrome")`.
	var Cu: Ci;
	var Cc: Cc;
	var Ci: Ci;
	var Services: Gecko.Services;

	// Global actor modules
	class JSWindowActorParent extends Gecko.JSWindowActorParent {}
	class JSWindowActorChild extends Gecko.JSWindowActorChild {}

	interface Document {
		/**
		 * Create a XUL element of a specific type. Right now this function
		 * only refines iframes, but more tags could be added.
		 */
		createXULElement: ((type: "iframe") => XULIframeElement) &
			((type: string) => XULElement);

		/**
		 * This is a fluent instance connected to this document.
		 */
		l10n: Gecko.FluentLocalization;
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
			where:
				| "current"
				| "tab"
				| "tabshifted"
				| "window"
				| "save",
			// TS-TODO
			params?: unknown
		) => void;
		openTrustedLinkIn: (
			url: string,
			where:
				| "current"
				| "tab"
				| "tabshifted"
				| "window"
				| "save",
			// TS-TODO
			params?: unknown
		) => void;
	}

	class ChromeWorker extends Worker {}

	interface MenuListElement extends XULElement {
		value: string;
		disabled: boolean;
	}

	interface XULCommandEvent extends Event {
		target: XULElement;
	}

	interface XULElementWithCommandHandler {
		addEventListener: (
			type: "command",
			handler: (event: XULCommandEvent) => void,
			isCapture?: boolean
		) => void;
		removeEventListener: (
			type: "command",
			handler: (event: XULCommandEvent) => void,
			isCapture?: boolean
		) => void;
	}

	type nsIPrefBranch = Gecko.nsIPrefBranch;

	interface Window {
		docShell: nsIDocShell;
		browserDOMWindow: any;
		XULBrowserWindow: any;
	}
}
