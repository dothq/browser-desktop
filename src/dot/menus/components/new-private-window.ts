import { MenuItem } from ".";
import { dot } from "../../api";

export class NewPrivateWindow extends MenuItem {
    public onClick() {
        dot.window.openNew({ type: "private" });
    }

    constructor() {
        super({
            id: "newprivate",
            type: "item",
            category: "browser",

            label: "New Private Window",
            description: "Create a New Private Window.",

            keybind: "CmdOrCtrl+Shift+P"
        });
    }
}
