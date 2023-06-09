/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ServicesWw {
	openWindow(
		parent: ChromeWindow,
		url: string,
		name: string,
		features: string,
		arguments: any
	): ChromeWindow;
	registerNotification(observer: object): void;
	unregisterNotification(bbserver: object): void;
	getWindowEnumerator(): IterableIterator<ChromeWindow>;
	getNewPrompter(
		parent: ChromeWindow
	): unknown /* todo: getNewPrompter: nsIPrompt */;
	getNewAuthPrompter(
		parent: ChromeWindow
	): unknown /* todo: getNewAuthPrompter: nsIAuthPrompt */;
	setWindowCreator(
		creator: unknown /* todo: creator: nsIWindowCreator */
	): void;
	hasWindowCreator(): boolean;
	getChromeForWindow(
		window: ChromeWindow
	): unknown /* todo: getChromeForWindow: nsIWebBrowserChrome */;
	getWindowByName(targetName: string): ChromeWindow;
	readonly activeWindow: ChromeWindow;
}
