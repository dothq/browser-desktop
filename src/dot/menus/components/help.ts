import { MenuItem } from ".";

export class Help extends MenuItem {
    constructor() {
        super({
            id: "help",
            type: "item",
            category: "browser",

            label: "Help",
            description:
                "Get help with using the browser.",

            keybind: "F1"
        });
    }
}
