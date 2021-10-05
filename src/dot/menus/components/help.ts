import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class Help extends MenuItem {
    constructor() {
        super({
            id: "context-help",
            type: "item",
            category: "browser",

            label: "Help",
            description:
                "Get help with using the browser.",

            hotkey: new Hotkey("F1")
        });
    }
}
