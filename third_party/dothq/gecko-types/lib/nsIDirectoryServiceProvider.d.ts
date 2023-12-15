/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIFile } from "./nsIFile";

export interface nsIDirectoryServiceProvider {
	/**
	 * getFile
	 *
	 * Directory Service calls this when it gets the first request for
	 * a prop or on every request if the prop is not persistent.
	 *
	 * @param prop         The symbolic name of the file.
	 * @param persistent   TRUE - The returned file will be cached by Directory
	 *                     Service. Subsequent requests for this prop will
	 *                     bypass the provider and use the cache.
	 *                     FALSE - The provider will be asked for this prop
	 *                     each time it is requested.
	 *
	 * @return             The file represented by the property.
	 *
	 */
	getFile(prop: string, persistent: boolean): nsIFile;
}

export interface nsIDirectoryServiceProvider2 {
	/**
	 * getFiles
	 *
	 * Directory Service calls this when it gets a request for
	 * a prop and the requested type is nsISimpleEnumerator.
	 *
	 * @param prop         The symbolic name of the file list.
	 *
	 * @return             An enumerator for a list of file locations.
	 *                     The elements in the enumeration are nsIFile
	 * @returnCode         NS_SUCCESS_AGGREGATE_RESULT if this result should be
	 *                     aggregated with other "lower" providers.
	 */
	getFiles(prop: string): Enumerator;
}
