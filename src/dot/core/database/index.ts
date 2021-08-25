import Dexie from "dexie";

export type DatabaseSchema = string[]

export class BaseDatabase extends Dexie {
    public name: string;

    public get db() {
        return this.table(this.name);
    }

    constructor({ name, version, schema }: { name: string, version: number, schema: DatabaseSchema }) {
        super(name);

        this.version(version).stores({
            [name]: Object.keys(schema).join(", "),
        });

        this.name = name;
    }
}