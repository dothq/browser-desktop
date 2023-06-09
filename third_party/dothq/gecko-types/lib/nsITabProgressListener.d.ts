/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChromeBrowser } from "./ChromeBrowser";
import { nsIRequest } from "./nsIRequest";
import { nsIURI } from "./nsIURI";
import { nsIWebProgress } from "./nsIWebProgress";
import { nsIWebProgressListener } from "./nsIWebProgressListener";

type Modify<T, R> = Omit<T, keyof R> & R;

export interface nsITabProgressListener
	extends Modify<
		nsIWebProgressListener,
		{
			onStateChange(
				browser: ChromeBrowser,
				webProgress: nsIWebProgress,
				request: nsIRequest,
				stateFlags: number,
				status: number
			): void;

			onProgressChange(
				browser: ChromeBrowser,
				webProgress: nsIWebProgress,
				request: nsIRequest,
				curSelfProgress: number,
				maxSelfProgress: number,
				curTotalProgress: number,
				maxTotalProgress: number
			): void;

			onLocationChange(
				browser: ChromeBrowser,
				webProgress: nsIWebProgress,
				request: nsIRequest,
				location: nsIURI,
				flags?: number,
				...rest: any
			): void;

			onStatusChange(
				browser: ChromeBrowser,
				webProgress: nsIWebProgress,
				request: nsIRequest,
				status: number,
				message: string
			): void;

			onSecurityChange(
				browser: ChromeBrowser,
				webProgress: nsIWebProgress,
				request: nsIRequest,
				state: number,
				...rest: any
			): void;

			onContentBlockingEvent(
				browser: ChromeBrowser,
				webProgress: nsIWebProgress,
				request: nsIRequest,
				event: number,
				...rest: any
			): void;
		}
	> {}
