/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowserTab } from "./BrowserTab";
import { ChromeBrowser } from "./ChromeBrowser";
import { MessageManager } from "./MessageManager";
import { nsIURI } from "./nsIURI";
import { nsIWebProgress } from "./nsIWebProgress";

export interface Browser {
	webProgress: nsIWebProgress;
	currentURI: nsIURI;
	addWebTab: (url: string, options: any) => BrowserTab;
	contentPrincipal: any;
	selectedTab: BrowserTab;
	selectedBrowser?: ChromeBrowser;
	messageManager: MessageManager;
	ownerDocument?: Document;

	tabs: BrowserTab[];

	init(): void;

	getBrowserForTab: (tab: BrowserTab) => ChromeBrowser | null;
	_tabForBrowser: Map<ChromeBrowser, BrowserTab>;

	setIcon: (tab: BrowserTab, iconURL: string) => void;
}
