import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class Bookmarks extends MenuItem {
    constructor() {
        super({
            id: "context-bookmarks",
            type: "item",
            category: "browser",

            label: "Bookmarks",
            icon: "bookmark.svg",
            description: "View all your saved bookmarks.",

            hotkey: new Hotkey("Ctrl", "B")
        });
    }
}
