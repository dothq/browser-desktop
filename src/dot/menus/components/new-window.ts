import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class NewWindow extends MenuItem {
    public onClick() {
        dot.window.openNew({ type: "normal" });
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