/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const BrowserCompatibility = {
	/**
	 * Defines a getter onto an object
	 * @param {object} object
	 * @param {string} name
	 * @param {() => any} getter
	 * @param {PropertyDescriptor} [options]
	 */
	defineGetter(object, name, getter, options) {
		return Object.defineProperty(object, name, {
			...(options || {}),
			get: getter,
		});
	},

	/**
	 * Defines a setter onto an object
	 * @param {object} object
	 * @param {string} name
	 * @param {(v: any) => void} setter
	 * @param {PropertyDescriptor} [options]
	 */
	defineSetter(object, name, setter, options) {
		return Object.defineProperty(object, name, {
			...(options || {}),
			set: setter,
		});
	},
};
