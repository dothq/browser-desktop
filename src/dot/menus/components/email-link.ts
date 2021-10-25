import { MenuItem } from ".";
import { dot } from "../../api";

export class EmailLink extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "emaillink",
            type: "item",
            category: "link",

            label: "Email Link",
            description:
                "Send the selected link as an email."
        });

        this.tabId = tabId;
    }
}
