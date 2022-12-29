/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIURI } from "./nsIURI";

export enum TRRMode {
	TRR_DEFAULT_MODE = 0,
	TRR_DISABLED_MODE = 1,
	TRR_FIRST_MODE = 2,
	TRR_ONLY_MODE = 3
}

export interface nsIRequest {
	name: string;
	isPending: boolean;
	status: number;
	cancel(status: number): void;
	suspend(): void;
	resume(): void;
	loadGroup: any /* @todo nsLoadGroup */;
	loadFlags: number;
	LOAD_REQUESTMASK: 0xffff;
	LOAD_NORMAL: 0;
	LOAD_BACKGROUND: number;
	LOAD_HTML_OBJECT_DATA: number;
	LOAD_DOCUMENT_NEEDS_COOKIE: number;
	getTRRMode(): TRRMode;
	setTRRMode(mode: TRRMode): void;
	LOAD_TRR_MASK: number;
	LOAD_TRR_DISABLED_MODE: number;
	LOAD_TRR_FIRST_MODE: number;
	LOAD_TRR_ONLY_MODE: number;
	cancelWithReason(status: number, reason: string): void;
	canceledReason: string;
	LOAD_ANONYMOUS_ALLOW_CLIENT_CERT: number;
	LOAD_RECORD_START_REQUEST_DELAY: number;
	INHIBIT_CACHING: number;
	INHIBIT_PERSISTENT_CACHING: number;
	LOAD_BYPASS_CACHE: number;
	LOAD_FROM_CACHE: number;
	VALIDATE_ALWAYS: number;
	VALIDATE_NEVER: number;
	VALIDATE_ONCE_PER_SESSION: number;
	LOAD_ANONYMOUS: number;
	LOAD_FRESH_CONNECTION: number;
	URI: nsIURI;
}
