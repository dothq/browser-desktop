import { MenuItem } from ".";
import { dot } from "../../api";

export class Paste extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "paste",
            type: "item",
            category: "edit",

            label: "Paste",
            icon: "paste.svg",
            description:
                "Paste copied text to text field.",

            keybind: "CmdOrCtrl+V"
        });

        this.tabId = tabId;
    }
}
