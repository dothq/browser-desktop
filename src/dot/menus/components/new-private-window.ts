import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class NewPrivateWindow extends MenuItem {
    public onClick() {
        dot.window.openNew({ type: "private" });
    }

    constructor() {
        super({
            id: "context-newprivate",
            type: "item",
            category: "browser",

            label: "New Private Window",
            description: "Create a New Private Window.",

            hotkey: new Hotkey("Ctrl", "Shift", "P")
        });
    }
}
