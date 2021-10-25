import { MenuItem } from ".";

export class Bookmarks extends MenuItem {
    constructor() {
        super({
            id: "bookmarks",
            type: "item",
            category: "browser",

            label: "Bookmarks",
            icon: "bookmark.svg",
            description: "View all your saved bookmarks.",

            keybind: "CmdOrCtrl+B"
        });
    }
}
