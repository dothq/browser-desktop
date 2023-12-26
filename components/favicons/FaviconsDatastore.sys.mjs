/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Datastore } = ChromeUtils.importESModule(
	"resource://gre/modules/Datastore.sys.mjs"
);

export class FaviconsDatastore extends Datastore {
	/**
	 * The version of this datastore
	 */
	static VERSION = 2;

	constructor() {
		super("favicons", {
			tables: {
				favicons: {
					id: "INTEGER PRIMARY KEY",
					data: "TEXT",
					size: "INTEGER",
					page_url: "TEXT"
				}
			}
		});
	}

	/**
	 * Migrates the database
	 * @param {number} localVersion
	 */
	#migrateDatabase(localVersion) {
		if (localVersion < this.version) {
			if (localVersion <= 1) {
				this.sql(`
                    ALTER TABLE favicons
                        DROP COLUMN url,
                        ADD data TEXT,
                        ADD size INTEGER;`);
			}
		}
	}

	/**
	 * Get a stored favicon using its ID
	 * @param {string} id
	 */
	getByID(id) {
		return this.sql(
			`
            SELECT * FROM favicons
            WHERE id = :id
        `,
			{ id }
		);
	}

	/**
	 * Get a stored favicon using a URL
	 * @param {string} url
	 */
	getForURL(url) {
		return this.sql(
			`
            SELECT * FROM favicons
            WHERE page_url = :page_url
        `,
			{ page_url: url }
		);
	}
}
