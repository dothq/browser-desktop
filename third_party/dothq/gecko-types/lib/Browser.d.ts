/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowserTab } from "./BrowserTab";
import { ChromeBrowser } from "./ChromeBrowser";
import { MessageManager } from "./MessageManager";
import { nsIDocShell } from "./nsIDocShell";
import { nsITabProgressListener } from "./nsITabProgressListener";
import { nsIURI } from "./nsIURI";
import { nsIWebProgress } from "./nsIWebProgress";
import { nsIWebProgressListener } from "./nsIWebProgressListener";

export interface Browser {
	webProgress: nsIWebProgress;
	currentURI: nsIURI;
	addWebTab: (url: string, options: any) => BrowserTab;
	contentPrincipal: any;
	selectedTab: BrowserTab;
	selectedBrowser?: ChromeBrowser;
	messageManager: MessageManager;
	ownerDocument?: Document;
	docShell: nsIDocShell;

	tabs: BrowserTab[];

	init(): void;

	getBrowserForTab: (tab: BrowserTab) => ChromeBrowser | null;
	getTabForBrowser: (browser: ChromeBrowser) => BrowserTab | null;

	_tabForBrowser: Map<ChromeBrowser, BrowserTab>;

	setIcon: (tab: BrowserTab, iconURL: string) => void;

	addProgressListener: (listener: nsIWebProgressListener) => void;
	addTabsProgressListener: (listener: nsITabProgressListener) => void;

	resetBrowserSharing: (browser: ChromeBrowser) => void;

	stop: () => void;

	addEventListener: HTMLElement["addEventListener"];
	removeEventListener: HTMLElement["removeEventListener"];

	loadTabs: (
		uris: string[],
		loadOptions?: {
			allowInheritPrincipal?: boolean;
			allowThirdPartyFixup?: boolean;
			inBackground?: boolean;
			newIndex?: number;
			postDatas?: any[] /* todo: postData: nsIInputStream */;
			replace?: boolean;
			targetTab?: boolean;
			triggeringPrincipal?: any /* todo: triggeringPrincipal: nsIPrincipal */;
			csp?: any /* todo: csp: nsIContentSecurityPolicy */;
			userContextId?: number;
			fromExternal?: boolean;
		},
	) => void;
}
