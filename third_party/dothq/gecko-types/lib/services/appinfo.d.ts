/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ServicesAppInfo {
	/**
	 * @see XREAppData.vendor
	 * @returns an empty string if XREAppData.vendor is not set.
	 */
	vendor: string;

	/**
	 * @see XREAppData.name
	 */
	name: string;

	/**
	 * @see XREAppData.ID
	 * @returns an empty string if XREAppData.ID is not set.
	 */
	ID: string;

	/**
	 * The version of the XUL application. It is different than the
	 * version of the XULRunner platform. Be careful about which one you want.
	 *
	 * @see XREAppData.version
	 * @returns an empty string if XREAppData.version is not set.
	 */
	version: string;

	/**
	 * The build ID/date of the application. For xulrunner applications,
	 * this will be different than the build ID of the platform. Be careful
	 * about which one you want.
	 */
	appBuildID: string;

	/**
	 * @see XREAppData.UAName
	 * @returns an empty string if XREAppData.UAName is not set.
	 */
	UAName: string;

	/**
	 * @see XREAppData.sourceURL
	 * @returns an empty string if XREAppData.sourceURL is not set.
	 */
	sourceURL: string;

	/**
	 * @see XREAppData.updateURL
	 */
	updateURL: string;

	/**
	 * The version of the XULRunner platform.
	 */
	platformVersion: string;

	/**
	 * The build ID/date of gecko and the XULRunner platform.
	 */
	platformBuildID: string;

	/**
	 * Determines whether we are in a safe mode session or not.
	 */
	inSafeMode: boolean;
}
