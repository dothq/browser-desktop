import { MenuItem } from ".";
import { dot } from "../../api";

export class OpenLinkInNewWindow extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-openlinkwindow",
            type: "item",
            category: "link",

            label: "Open Link in New Window",
            description: "Opens the selected link in a New Window."
        })

        this.tabId = tabId;
    }
}