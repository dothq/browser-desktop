import { MenuItem } from ".";
import { dot } from "../../api";

export class SetDesktopBackground extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "setdesktopbg",
            type: "item",
            category: "image",

            label: "Set as Desktop Background",
            description:
                "Send the selected image as your desktop background."
        });

        this.tabId = tabId;
    }
}
