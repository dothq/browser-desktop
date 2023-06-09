/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BrowsingContext } from "../BrowsingContext";
import { nsIURI } from "../nsIURI";

export interface nsIURIFixupInfo {
	consumer: BrowsingContext;
	preferredURI: nsIURI;
	fixedURI: nsIURI;
	keywordProviderName: string;
	keywordAsSent: string;
	fixupChangedProtocol: boolean;
	fixupCreatedAlternateURI: boolean;
	originalInput: string;
	postData: unknown /* todo: postData: nsIInputStream */;
}

export interface ServicesUriFixup {
	FIXUP_FLAG_NONE: 0;
	FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP: 1;
	FIXUP_FLAGS_MAKE_ALTERNATE_URI: 2;
	FIXUP_FLAG_PRIVATE_CONTEXT: 4;
	FIXUP_FLAG_FIX_SCHEME_TYPOS: 8;
	FIXUP_FLAG_FORCE_ALTERNATE_URI: 16;
	getFixupURIInfo(
		aURIText: string,
		aFixupFlags?: number
	): nsIURIFixupInfo;
	webNavigationFlagsToFixupFlags(
		aURIText: string,
		aDocShellFlags: number
	): number;
	keywordToURI(
		aKeyword: string,
		aIsPrivateContext?: boolean
	): nsIURIFixupInfo;
	forceHttpFixup(aUriString: string): nsIURIFixupInfo;
	checkHost(
		aURI: nsIURI,
		aListener: unknown /* todo: aListener: nsIDNSListener */,
		aOriginAttributes?: any
	): void;
	isDomainKnown(aDomain: string): boolean;
}
