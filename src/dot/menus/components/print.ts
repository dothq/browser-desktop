import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class PrintPage extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-print",
            type: "item",
            category: "general",

            label: "Print…",
            icon: "print.svg",
            description: "Print the current page.",

            hotkey: new Hotkey("Ctrl", "P")
        })

        this.tabId = tabId;
    }
}