import { MenuItem } from ".";

export class Notes extends MenuItem {
    constructor() {
        super({
            id: "notes",
            type: "item",
            category: "browser",

            label: "Notes",
            icon: "notes.svg",
            description: "View all your saved notes.",

            keybind: "CmdOrCtrl+K"
        });
    }
}
