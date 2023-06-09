/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Gecko from ".";

export interface Ci {
	nsIAppWindow: Gecko.nsIAppWindow;
	nsIArray: Gecko.nsIArray;
	nsIChannel: Gecko.nsIChannel;
	nsIDocShell: Gecko.nsIDocShell;
	nsIDragService: Gecko.nsIDragService;
	nsIEnvironment: Gecko.nsIEnvironment;
	nsIFilePicker: Gecko.nsIFilePicker;
	nsIInterfaceRequestor: Gecko.nsIInterfaceRequestor;
	nsILoadContext: Gecko.nsILoadContext;
	nsIPrefBranch: Gecko.nsIPrefBranch;
	nsIRequest: Gecko.nsIRequest;
	nsITabProgressListener: Gecko.nsITabProgressListener;
	nsIURI: Gecko.nsIURI;
	nsIWebProgress: Gecko.nsIWebProgress;
	nsIWebProgressListener: Gecko.nsIWebProgressListener;
	nsIXULBrowserWindow: Gecko.nsIXULBrowserWindow;
	[key: string]: unknown & any;
}
