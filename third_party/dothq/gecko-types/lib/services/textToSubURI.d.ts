/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ServicesTextToSubURI {
	ConvertAndEscape: (charset: string, text: string) => string;
	UnEscapeAndConvert: (charset: string, text: string) => string;
	unEscapeNonAsciiURI: (
		charset: string,
		uriFragment: string
	) => string;
	unEscapeURIForUI: (
		uriFragment: string,
		dontEscape?: boolean
	) => string;
}
