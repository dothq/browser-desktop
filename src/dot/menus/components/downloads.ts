import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class Downloads extends MenuItem {
    constructor() {
        super({
            id: "context-downloads",
            type: "item",
            category: "browser",

            label: "Downloads",
            icon: "download.svg",
            description:
                "View all your recently downloaded files.",

            hotkey: new Hotkey("Ctrl", "J")
        });
    }
}
