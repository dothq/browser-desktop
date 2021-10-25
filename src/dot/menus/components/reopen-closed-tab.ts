import { MenuItem } from ".";

export class ReopenClosedTab extends MenuItem {
    constructor() {
        super({
            id: "reopentab",
            type: "item",
            category: "window",

            label: "Reopen closed tab",
            keybind: "CmdOrCtrl+Shift+T",
            description:
                "Reopens the previously closed tab."
        });
    }
}
