/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIDirectoryServiceProvider } from "./nsIDirectoryServiceProvider";

export interface nsIDirectoryService {
	/**
	 * init
	 *
	 * Must be called. Used internally by XPCOM initialization.
	 *
	 */
	init(): void;

	/**
	 * registerProvider
	 *
	 * Register a provider with the service.
	 *
	 * @param prov            The service will keep a strong reference
	 *                        to this object. It will be released when
	 *                        the service is released.
	 *
	 */
	registerProvider(prov: nsIDirectoryServiceProvider): void;

	/**
	 * unregisterProvider
	 *
	 * Unregister a provider with the service.
	 *
	 * @param prov
	 *
	 */
	unregisterProvider(prov: nsIDirectoryServiceProvider): void;
}
