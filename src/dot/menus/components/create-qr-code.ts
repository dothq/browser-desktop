import { MenuItem } from ".";
import { dot } from "../../api";

export class CreateQRCode extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "createqr",
            type: "item",
            category: "page",

            label: "Create QR Code of Page…",
            description:
                "Creates a QR Code of the current page URL"
        });

        this.tabId = tabId;
    }
}
