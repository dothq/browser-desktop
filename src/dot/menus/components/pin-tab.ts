import { MenuItem } from ".";
import { dot } from "../../api";

export class PinTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-pintab",
            type: "item",
            category: "page",

            label: "Pin Tab",
            description: "Pins the current tab."
        });

        this.tabId = tabId;
    }
}
