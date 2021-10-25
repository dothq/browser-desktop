import { MenuItem } from ".";
import { dot } from "../../api";

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
            id: "closetab",
            type: "item",
            category: "page",

            label: "Close",
            icon: "close.svg",
            description: "Closes the current tab.",

            keybind: "CmdOrCtrl+W"
        });

        this.tabId = tabId;
    }
}
