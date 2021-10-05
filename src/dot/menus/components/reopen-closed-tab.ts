import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class ReopenClosedTab extends MenuItem {
    constructor() {
        super({
            id: "context-reopentab",
            type: "item",
            category: "window",

            label: "Reopen closed tab",
            hotkey: new Hotkey("Ctrl", "Shift", "T"),
            description:
                "Reopens the previously closed tab."
        });
    }
}
