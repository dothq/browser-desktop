/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Sqlite } = ChromeUtils.importESModule(
	"resource://gre/modules/Sqlite.sys.mjs"
);

const { ConsoleAPI } = ChromeUtils.importESModule(
	"resource://gre/modules/Console.sys.mjs"
);

const { setTimeout } = ChromeUtils.importESModule(
	"resource://gre/modules/Timer.sys.mjs"
);

const MAX_ATTEMPTS = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class Datastore {
	/**
	 * Creates a new datastore
	 * @param {string} name
	 * @param {{ version: number; tables: Record<string, Record<string, string>> }} schema
	 */
	constructor(name, schema) {
		this.#name = name;
		this.#version = schema.version;
		this.#schema = schema;
	}

	/**
	 * The name of this datastore
	 */
	#name = null;

	/**
	 * The current version of this datastore
	 */
	#version = null;

	/**
	 * The schema of this datastore
	 * @type {{ tables: Record<string, Record<string, string>> }}
	 */
	#schema = null;

	/**
	 * The current attempt to connect to the datastore
	 */
	#connectionAttempt = 0;

	/**
	 * @type {Console}
	 */
	#logger = new ConsoleAPI({
		maxLogLevel: "warn",
		maxLogLevelPref: "dot.datastore.loglevel",
		prefix: "Datastore.sys.mjs"
	});

	/**
	 * The path to the browser_storage directory in the profile dir
	 */
	get browserStoragePath() {
		return PathUtils.join(PathUtils.profileDir, "browser_storage");
	}

	/**
	 * The path to the datastore on disk
	 */
	get path() {
		return PathUtils.join(this.browserStoragePath, `${this.#name}.sqlite`);
	}

	/**
	 * Creates a backup of the datastore and resets the file
	 */
	async #backupAndReset() {
		this.#logger.warn(
			`${this.#name}: Backing up and resetting the datastore...`
		);

		if (this._conn) await this._conn.close();

		const backupFile = this.path + ".corrupt";

		const uniquePath = await IOUtils.createUniqueFile(
			PathUtils.parent(backupFile),
			PathUtils.filename(backupFile),
			0o600
		);
		await IOUtils.copy(this.path, uniquePath);
		await IOUtils.remove(this.path);
	}

	/**
	 * Creates a new table with columns
	 * @param {string} tableName
	 * @param {Record<string, string>} columns
	 */
	async createTable(tableName, columns) {
		const columnsStr = [];

		for (const [column, type] of Object.entries(columns)) {
			columnsStr.push(`${column} ${type}`);
		}

		const sql = `CREATE TABLE ${tableName} (
            ${columnsStr.join(",\n")}
        )`;

		this.#logger.debug(`${this.#name}: Performing SQL:\n` + sql);

		await this._conn.execute(sql);
	}

	/**
	 * Initialises the database and its tables
	 */
	async #initDatabase() {
		for (const [table, schema] of Object.entries(this.#schema.tables)) {
			await this.createTable(table, schema);
		}
	}

	async #migrateDatabase() {}

	async initConnection() {
		this.#logger.debug(
			`${this.#name}: Creating connection to datastore... (attempt ${
				this.#connectionAttempt
			})`
		);

		try {
			await IOUtils.makeDirectory(this.browserStoragePath, {
				ignoreExisting: true
			});

			this._conn = await Sqlite.openConnection({ path: this.path });

			Sqlite.shutdown.addBlocker(`Closing ${this.#name} datastore`, () =>
				this._conn.close()
			);
		} catch (e) {
			if (this.#connectionAttempt < MAX_ATTEMPTS) {
				this.#logger.error(
					`${this.#name}: Failed to connect to datastore:\n` +
						e +
						"\n" +
						e.stack || ""
				);

				if (e.result === Cr.NS_ERROR_FILE_CORRUPTED) {
					this.#logger.warn(
						`${
							this.#name
						}: Datastore is corrupt, backing up and resetting.`
					);

					await this.#backupAndReset();
				} else {
					if (this._conn) await this._conn.close();

					await sleep(2 ** this.#connectionAttempt * 10);
				}

				this.#connectionAttempt++;
				return this.initConnection();
			}

			if (this._conn) await this._conn.close();

			this.#logger.error(
				`${this.#name}: Failed to connect to datastore after ${
					this.#connectionAttempt
				} attempts.`
			);
			throw e;
		}

		try {
			const databaseVersion = parseInt(
				await this._conn.getSchemaVersion()
			);

			if (databaseVersion === 0) {
				// If the resolved database version is 0, we don't
				// have any data, so we should init the database

				await this.#initDatabase();
			} else if (databaseVersion < this.#version) {
				// If the version of the database on the user's computer
				// is less than what the browser is currently on,
				// begin the migration process for the database.

				await this.#migrateDatabase(databaseVersion);
			}

			await this._conn.setSchemaVersion(this.#version);
		} catch (e) {
			await this._conn.close();

			this.#logger.error(
				`${this.#name}: Failed to init and migrate the datastore:\n` +
					e +
					"\n" +
					e.stack || ""
			);
		}
	}
}
