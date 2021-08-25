import { BaseDatabase } from ".";

interface Schema {
    id: string,
    title: string,
    url: string,
    parent_id: string,
    added_date: string,
    last_mod_date: string
}

export class BookmarksDatabase extends BaseDatabase {
    constructor() {
        super({
            name: "bookmarks",
            version: 1,
            schema: [
                "id",
                "title",
                "url",
                "parent_id",
                "added_date",
                "last_mod_date"
            ]
        });
    }

    public async create({ id, title, url, parent_id, added_date, last_mod_date }: Partial<Schema>) {
        return await this.db.add({
            id,
            title,
            url,
            parent_id,
            added_date,
            last_mod_date
        }, id);
    }

    public async getById(id: string) {
        return await this.db.get({ id });
    }
}