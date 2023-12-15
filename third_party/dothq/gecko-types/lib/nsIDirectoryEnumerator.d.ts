/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIFile } from "./nsIFile";

export interface nsIDirectoryEnumerator extends Enumerator {
	/**
	 * Retrieves the next file in the sequence. The "nextFile" element is the
	 * first element upon the first call. This attribute is null if there is no
	 * next element.
	 */
	readonly nextFile: nsIFile;

	/**
	 * Closes the directory being enumerated, releasing the system resource.
	 * @throws NS_OK if the call succeeded and the directory was closed.
	 *         NS_ERROR_FAILURE if the directory close failed.
	 *         It is safe to call this function many times.
	 */
	close(): void;
}
