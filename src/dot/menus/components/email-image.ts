import { MenuItem } from ".";
import { dot } from "../../api";

export class EmailImage extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "emailimage",
            type: "item",
            category: "image",

            label: "Email Image",
            description:
                "Send the selected image as an email."
        });

        this.tabId = tabId;
    }
}
