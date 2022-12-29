/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChromeBrowser } from "./ChromeBrowser";
import { nsIURI } from "./nsIURI";

export interface BrowserUIUtils {
	checkEmptyPageOrigin(
		browser: ChromeBrowser,
		uri?: nsIURI
	): boolean;
	setToolbarButtonHeightProperty(element: Element): Promise<void>;
	getLocalizedFragment(
		doc: Document,
		msg: string,
		...nodesOrStrings: any[]
	): DocumentFragment;
	removeSingleTrailingSlashFromURL(url: string): string;
	trimURLProtocol: string;
	trimURL(url: string): string;
}
