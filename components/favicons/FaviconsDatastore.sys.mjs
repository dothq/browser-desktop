/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Datastore } = ChromeUtils.importESModule(
	"resource://gre/modules/Datastore.sys.mjs"
);

export class FaviconsDatastore extends Datastore {
	constructor() {
		super("favicons", {
			version: 1,
			tables: {
				favicons: {
					id: "INTEGER PRIMARY KEY",
					data: "TEXT NOT NULL",
					page_url: "TEXT NOT NULL"
				}
			}
		});
	}

	/**
	 * Get a stored favicon using a URL
	 * @param {string} url
	 */
	getForURL(url) {
		return this._conn;
	}
}
