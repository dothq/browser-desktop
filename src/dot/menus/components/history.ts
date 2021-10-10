import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class History extends MenuItem {
    constructor() {
        super({
            id: "context-history",
            type: "item",
            category: "browser",

            label: "History",
            icon: "history.svg",
            description:
                "View all your recently visited pages.",

            hotkey: new Hotkey("Ctrl", "H")
        });
    }
}
