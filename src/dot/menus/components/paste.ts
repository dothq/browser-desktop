import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class Paste extends MenuItem {
    public tabId: number;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId }: { tabId: number }) {
        super({
            id: "context-paste",
            type: "item",
            category: "edit",

            label: "Paste",
            icon: "paste.svg",
            description:
                "Paste copied text to text field.",

            hotkey: new Hotkey("Ctrl", "V")
        });

        this.tabId = tabId;
    }
}
