import { MenuItem } from ".";

export class Quit extends MenuItem {
    public onClick() {
        window.close();
    }

    constructor() {
        super({
            id: "quit",
            type: "item",
            category: "browser",

            label: "Quit",
            description: "Exit the browser.", // Why would you ever want to do that??

            keybind: "CmdOrCtrl+Q"
        });
    }
}
