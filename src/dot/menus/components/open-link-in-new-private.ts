import { MenuItem } from ".";
import { dot } from "../../api";

export class OpenLinkInNewPrivate extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "openlinkprivate",
            type: "item",
            category: "link",

            label: "Open Link in New Private Window",
            description:
                "Opens the selected link in a New Private Window."
        });

        this.tabId = tabId;
    }
}
