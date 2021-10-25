import { MenuItem } from ".";
import { dot } from "../../api";

export class NewWindow extends MenuItem {
    public onClick() {
        dot.window.openNew({ type: "normal" });
    }

    constructor() {
        super({
            id: "newwindow",
            type: "item",
            category: "browser",

            label: "New Window",
            icon: "new-window.svg",
            description: "Create a New Window.",

            keybind: "CmdOrCtrl+N"
        });
    }
}
