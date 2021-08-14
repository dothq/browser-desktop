import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class NewWindow extends MenuItem {
    public onClick() {

    }

    constructor() {
        super({
            id: "context-newwindow",
            type: "item",
            category: "browser",

            label: "New Window",
            icon: "new-window.svg",
            description: "Create a New Window.",

            hotkey: new Hotkey("Ctrl", "N")
        })
    }
}