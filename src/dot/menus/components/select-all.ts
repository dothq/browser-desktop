import { MenuItem } from ".";
import { dot } from "../../api";

export class SelectAll extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "selectall",
            type: "item",
            category: "general",

            label: "Select All",
            description:
                "Select all text on page or in text field.",

            keybind: "CmdOrCtrl+A"
        });

        this.tabId = tabId;
    }
}
