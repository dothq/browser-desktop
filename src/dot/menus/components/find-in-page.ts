import { MenuItem } from ".";
import { Hotkey } from "../hotkey";

export class FindInPage extends MenuItem {
    constructor() {
        super({
            id: "context-findinpage",
            type: "item",
            category: "general",

            label: "Find in Page…",
            icon: "find-in-content.svg",
            description:
                "Locate text on the current page.",

            hotkey: new Hotkey("Ctrl", "F")
        });
    }

    public onClick() {
        
    }
}
