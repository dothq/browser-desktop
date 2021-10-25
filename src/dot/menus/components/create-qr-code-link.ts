import { MenuItem } from ".";
import { dot } from "../../api";

export class CreateQRCodeLink extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "createqrlink",
            type: "item",
            category: "link",

            label: "Create QR Code of Link…",
            description:
                "Creates a QR Code of the current page URL"
        });

        this.tabId = tabId;
    }
}
