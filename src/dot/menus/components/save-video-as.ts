import { MenuItem } from ".";
import { dot } from "../../api";

export class SaveVideoAs extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "savevideo",
            type: "item",
            category: "multimedia",

            label: "Save Video As…",
            description:
                "Saves the selected video to file."
        });

        this.tabId = tabId;
    }
}
