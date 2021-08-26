import { MenuItem } from ".";
import { dot } from "../../api";

export class CloseTabsToRight extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-closetabstoright",
            type: "item",
            category: "page",

            label: "Close tabs to right",
            icon: "close-tabs-to-right.svg",
            description: "Closes all tabs to the right of the selected tab."
        })

        this.tabId = tabId;
    }
}