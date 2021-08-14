import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class NewPrivateWindow extends MenuItem {
    public onClick() {

    }

    constructor() {
        super({
            id: "context-newprivate",
            type: "item",
            category: "browser",

            label: "New Private Window",
            description: "Create a New Private Window.",

            hotkey: new Hotkey("Ctrl", "Shift", "P")
        })
    }
}