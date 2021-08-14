import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class Notes extends MenuItem {
    constructor() {
        super({
            id: "context-notes",
            type: "item",
            category: "browser",

            label: "Notes",
            icon: "notes.svg",
            description: "View all your saved notes.",

            hotkey: new Hotkey("Ctrl", "K")
        })
    }
}