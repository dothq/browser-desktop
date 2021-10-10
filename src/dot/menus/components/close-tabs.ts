import { MenuItem } from ".";
import { dot } from "../../api";

export class CloseTabs extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-closetabs",
            type: "item",
            category: "page",

            label: "Close other tabs",
            icon: "close-tabs.svg",
            description:
                "Closes all tabs except the selected one."
        });

        this.tabId = tabId;
    }
}
