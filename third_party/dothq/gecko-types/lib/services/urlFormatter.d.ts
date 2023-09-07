/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ServicesURLFormatter {
	/**
	 * formatURL - Formats a string URL
	 *
	 * The set of known variables is predefined.
	 * If a variable is unknown, it is left unchanged and a non-fatal error is reported.
	 *
	 * @param format string Unformatted URL.
	 *
	 * @return The formatted URL.
	 */
	formatURL(format: string): string;

	/**
	 * formatURLPref - Formats a string URL stored in a preference
	 *
	 * If the preference value cannot be retrieved, a fatal error is reported
	 * and the "about:blank" URL is returned.
	 *
	 * @param pref string Preference name.
	 *
	 * @return The formatted URL returned by formatURL(), or "about:blank".
	 */
	formatURLPref(pref: string): string;

	/**
	 * Remove all of the sensitive query parameter strings from URLs in |aMsg|.
	 */
	trimSensitiveURLs(msg: string): string;
}
