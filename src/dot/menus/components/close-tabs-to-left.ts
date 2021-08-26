import { MenuItem } from ".";
import { dot } from "../../api";

export class CloseTabsToLeft extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-closetabstoleft",
            type: "item",
            category: "page",

            label: "Close tabs to left",
            icon: "close-tabs-to-left.svg",
            description: "Closes all tabs to the left of the selected tab."
        })

        this.tabId = tabId;
    }
}