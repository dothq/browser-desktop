/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsIException {
	filename: string;
	name: string;
	sourceId: number;
	lineNumber: number;
	columnNumber: number;
	sourceLine: string;
	asyncCause: string;
	asyncCaller: any;
	caller: any;
	formattedStack: string;
	nativeSavedFrame: any;
	toString(): string;
}
