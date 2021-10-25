import { MenuItem } from ".";

export class FindInPage extends MenuItem {
    constructor() {
        super({
            id: "findinpage",
            type: "item",
            category: "general",

            label: "Find in Page…",
            icon: "find-in-content.svg",
            description:
                "Locate text on the current page.",

            keybind: "CmdOrCtrl+F"
        });
    }

    public onClick() {
        
    }
}
