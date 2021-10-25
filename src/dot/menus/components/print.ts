import { MenuItem } from ".";
import { dot } from "../../api";

export class PrintPage extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "print",
            type: "item",
            category: "general",

            label: "Print…",
            icon: "print.svg",
            description: "Print the current page.",

            keybind: "CmdOrCtrl+P"
        });

        this.tabId = tabId;
    }
}
