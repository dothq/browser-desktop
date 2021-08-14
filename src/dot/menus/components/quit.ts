import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class Quit extends MenuItem {
    constructor() {
        super({
            id: "context-quit",
            type: "item",
            category: "browser",

            label: "Quit",
            description: "Exit the browser.", // Why would you ever want to do that??

            hotkey: new Hotkey("Ctrl", "Q")
        })
    }
}