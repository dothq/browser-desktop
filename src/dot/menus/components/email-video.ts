import { MenuItem } from ".";
import { dot } from "../../api";

export class EmailVideo extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "emailvideo",
            type: "item",
            category: "multimedia",

            label: "Email Video",
            description:
                "Send the selected video as an email."
        });

        this.tabId = tabId;
    }
}
