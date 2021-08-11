import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class SelectAll extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-selectall",
            type: "item",
            category: "general",

            label: "Select All",
            description: "Select all text on page or in text field.",

            hotkey: new Hotkey("Ctrl", "A")
        })

        this.tabId = tabId;
    }
}