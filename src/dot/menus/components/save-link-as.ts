import { MenuItem } from ".";
import { dot } from "../../api";

export class SaveLinkAs extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "savelink",
            type: "item",
            category: "link",

            label: "Save Link As…",
            description:
                "Saves the selected link to file."
        });

        this.tabId = tabId;
    }
}
