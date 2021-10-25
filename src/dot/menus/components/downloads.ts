import { MenuItem } from ".";

export class Downloads extends MenuItem {
    constructor() {
        super({
            id: "downloads",
            type: "item",
            category: "browser",

            label: "Downloads",
            icon: "download.svg",
            description:
                "View all your recently downloaded files.",

            keybind: "CmdOrCtrl+J"
        });
    }
}
