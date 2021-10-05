import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class NewTab extends MenuItem {
    public onClick() {
        dot.utilities.doCommand("Browser:NewTab");
    }

    constructor() {
        super({
            id: "context-newtab",
            type: "item",
            category: "browser",

            label: "New Tab",
            icon: "add.svg",
            description: "Create a New Tab.",

            hotkey: new Hotkey("Ctrl", "T")
        });
    }
}
