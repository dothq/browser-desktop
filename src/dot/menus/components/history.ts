import { MenuItem } from ".";

export class History extends MenuItem {
    constructor() {
        super({
            id: "history",
            type: "item",
            category: "browser",

            label: "History",
            icon: "history.svg",
            description:
                "View all your recently visited pages.",

            keybind: "CmdOrCtrl+H"
        });
    }
}
