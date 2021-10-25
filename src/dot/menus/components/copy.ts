import { MenuItem } from ".";
import { dot } from "../../api";

export class Copy extends MenuItem {
    public tabId: number;
    public highlightedText: string;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get disabled() {
        return this.highlightedText
            ? this.highlightedText.length == 0
            : true;
    }

    constructor({
        tabId,
        highlightedText
    }: {
        tabId: number;
        highlightedText: string;
    }) {
        super({
            id: "copy",
            type: "item",
            category: "edit",

            label: "Copy",
            icon: "copy.svg",
            description:
                "Copy highlighted text to clipboard.",

            keybind: "CmdOrCtrl+C"
        });

        this.tabId = tabId;
        this.highlightedText = highlightedText;
    }
}
