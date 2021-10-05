import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class CloseTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public onClick() {
        return this.tab?.destroy();
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-closetab",
            type: "item",
            category: "page",

            label: "Close",
            icon: "close.svg",
            description: "Closes the current tab.",

            hotkey: new Hotkey("Ctrl", "W")
        });

        this.tabId = tabId;
    }
}
