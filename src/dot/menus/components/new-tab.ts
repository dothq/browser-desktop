import { MenuItem } from ".";
import { dot } from "../../api";

export class NewTab extends MenuItem {
    public onClick() {
        dot.utilities.doCommand("Browser:NewTab");
    }

    constructor() {
        super({
            id: "newtab",
            type: "item",
            category: "browser",

            label: "New Tab",
            icon: "add.svg",
            description: "Create a New Tab.",

            keybind: "CmdOrCtrl+T"
        });
    }
}
