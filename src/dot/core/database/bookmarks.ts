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
            schema: {
                id: ["TEXT"],
                title: ["TEXT"],
                url: ["TEXT"],
                parent_id: ["TEXT", "NOT NULL"],
                date_created: ["INT"],
                date_modified: ["INT"]
            }
        });
    }
}