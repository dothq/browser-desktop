import { MenuItem } from ".";
import { dot } from "../../api";

export class OpenLinkInNewTab extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-openlinktab",
            type: "item",
            category: "link",

            label: "Open Link in New Tab",
            description: "Opens the selected link in a New Tab."
        })

        this.tabId = tabId;
    }
}