import { MenuItem } from ".";
import { dot } from "../../api";

export class GoForward extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get disabled() {
        return !this.tab?.canGoForward;
    }

    public onClick() {
        return this.tab?.goForward();
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "forward",
            type: "item",
            category: "page",

            label: "Forward",
            icon: "forward.svg",
            description: "Go forward to the next page.",

            keybind: "Alt+Right"
        });

        this.tabId = tabId;
    }
}
