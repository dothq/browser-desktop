/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsIProperties {
	/**
	 * Gets a property with a given name.
	 *
	 * @throws NS_ERROR_FAILURE if a property with that name doesn't exist.
	 * @throws NS_ERROR_NO_INTERFACE if the found property fails to QI to the
	 * given iid.
	 */
	get<V = any>(prop: string, iid: V): V;

	/**
	 * Sets a property with a given name to a given value.
	 */
	set(prop: string, value: any): any;

	/**
	 * Returns true if the property with the given name exists.
	 */
	has(prop: string): boolean;

	/**
	 * Undefines a property.
	 * @throws NS_ERROR_FAILURE if a property with that name doesn't
	 * already exist.
	 */
	undefine(prop: string): any;

	/**
	 *  Returns an array of the keys.
	 */
	getKeys(): string[];
}
