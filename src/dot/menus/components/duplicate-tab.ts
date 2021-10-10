import { MenuItem } from ".";
import { dot } from "../../api";

export class DuplicateTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-duplicatetab",
            type: "item",
            category: "page",

            label: "Duplicate Tab",
            icon: "duplicate-tab.svg",
            description: "Duplicates the current tab."
        });

        this.tabId = tabId;
    }
}
