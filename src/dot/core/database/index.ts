import { SQLBuilder, SQLTableSchemaType } from "@dothq/sqb";
import { AsyncShutdown, OS, Sqlite } from "../../modules";

export class BaseDatabase {
    public name: string;
    public version: number;
    public schema: Record<string, SQLTableSchemaType[]>;

    private db: any;

    public get path() {
        return OS.Path.join(
            OS.Constants.Path.profileDir,
            "user-data",
            `${this.name}.sqlite`
        );
    }

    public async checkForErrors() {
        const check = async () => {
            const data = await this.db.execute(
                "PRAGMA integrity_check",
                null
            );

            return data.getResultByIndex(0) === "ok";
        }

        try {
            if (await check()) {
                return;
            }

            try {
                await this.db.execute("REINDEX");
            } catch (e) { }

            if (!(await check())) {
                throw new Error(`Database ${this.name} is corrupt and cannot be loaded.`)
            }
        } catch (e) { }
    }

    private async init() {
        await OS.File.makeDir(
            OS.Path.join(OS.Constants.Path.profileDir, "user-data"),
            { ignoreExisting: true }
        );

        let db = await Sqlite.openConnection({
            path: this.path
        });

        this.db = db;

        await this.checkForErrors();

        try {
            const databaseVersion = parseInt(
                await this.db.getSchemaVersion()
            );

            if (!databaseVersion) {
                const query = new SQLBuilder()
                    .createTable(
                        this.name,
                        this.schema
                    );

                await this.db.execute(query.toSQL());
            } else if (databaseVersion < this.version) {
                // todo: add migrations
            }

            await db.setSchemaVersion(this.version);
        } catch (e) {
            await db.close();
            throw e;
        }

        AsyncShutdown.profileBeforeChange.addBlocker(
            `UDS: Shutting down ${this.name} database...`,
            async () => {
                console.log(`UDS: Shutting down ${this.name} database...`);
                await db.close();
            }
        );
    }

    constructor({ name, version, schema }: { name: string, version: number, schema: Record<string, SQLTableSchemaType[]> }) {
        this.name = name;
        this.version = version;
        this.schema = schema;

        this.init();
    }
}