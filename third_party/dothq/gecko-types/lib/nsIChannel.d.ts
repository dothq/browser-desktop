/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIInterfaceRequestor } from "./nsIInterfaceRequestor";
import { nsIRequest } from "./nsIRequest";
import { nsIURI } from "./nsIURI";

export interface nsIChannel extends nsIRequest {
	originalURI: nsIURI;
	URI: nsIURI;
	owner: any /* @todo nsISupports */;
	notificationCallbacks: nsIInterfaceRequestor;
	securityInfo: any /* @todo nsITransportSecurityInfo */;
	contentType: string;
	contentCharset: string;
	contentLength: number;
	open(): any /* @todo nsIInputStream */;
	asyncOpen(listener: any /* @todo nsIStreamListener */): void;
	canceled: boolean;
	LOAD_DOCUMENT_URI: number;
	LOAD_RETARGETED_DOCUMENT_URI: number;
	LOAD_REPLACE: number;
	LOAD_INITIAL_DOCUMENT_URI: number;
	LOAD_TARGETED: number;
	LOAD_CALL_CONTENT_SNIFFERS: number;
	LOAD_BYPASS_URL_CLASSIFIER: number;
	LOAD_MEDIA_SNIFFER_OVERRIDES_CONTENT_TYPE: number;
	LOAD_EXPLICIT_CREDENTIALS: number;
	LOAD_BYPASS_SERVICE_WORKER: number;
	contentDisposition: number;
	DISPOSITION_INLINE: 0;
	DISPOSITION_ATTACHMENT: 1;
	DISPOSITION_FORCE_INLINE: 2;
	contentDispositionFilename: string;
	contentDispositionHeader: string;
	loadInfo: any /* @todo nsILoadInfo */;
	isDocument: boolean;
}
