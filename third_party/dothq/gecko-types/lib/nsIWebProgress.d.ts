/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowsingContext } from "./BrowsingContext";
import { nsIRequest } from "./nsIRequest";
import { nsIWebProgressListener } from "./nsIWebProgressListener";

export interface nsIWebProgress {
	NOTIFY_STATE_REQUEST: 0x00000001;
	NOTIFY_STATE_DOCUMENT: 0x00000002;
	NOTIFY_STATE_NETWORK: 0x00000004;
	NOTIFY_STATE_WINDOW: 0x00000008;
	NOTIFY_STATE_ALL: 0x0000000f;
	NOTIFY_PROGRESS: 0x00000010;
	NOTIFY_STATUS: 0x00000020;
	NOTIFY_SECURITY: 0x00000040;
	NOTIFY_LOCATION: 0x00000080;
	NOTIFY_REFRESH: 0x00000100;
	NOTIFY_CONTENT_BLOCKING: 0x00000200;
	NOTIFY_ALL: 0x000003ff;

	addProgressListener(
		listener: nsIWebProgressListener,
		notifyMask: number
	): void;
	removeProgressListener(listener: nsIWebProgressListener): void;

	browsingContext: BrowsingContext;

	getBrowsingContext(): BrowsingContext;

	DOMWindow: any /* @todo mozIDOMWindowProxy */;

	isTopLevel: boolean;

	isLoadingDocument: boolean;

	loadType: number;

	target: any /* @todo nsIEventTarget */;

	documentRequest: nsIRequest;
}
