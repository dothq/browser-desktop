/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ChromeUtils {
	/**
	 * Synchronously loads and evaluates the js file located at
	 * 'resourceURI' with a new, fully privileged global object.
	 *
	 * @param resourceURI A resource:// URI string to load the module from.
	 * @returns the module code's global object.
	 *
	 */
	import: <T extends any>(
		resourceURI: string
	) => { [key: string]: T };
	importESModule: <T extends any>(
		resourceURI: string
	) => { [key: string]: T };
	defineModuleGetter: (
		target: any,
		variable: string,
		path: string
	) => void;
	generateQI: (contractIDs: string[]) => any;
	defineLazyModuleGetters: (
		target: any,
		bindings: Record<string, string>
	) => void;
	defineESModuleGetters: (
		target: any,
		bindings: Record<string, string>
	) => void;
}
