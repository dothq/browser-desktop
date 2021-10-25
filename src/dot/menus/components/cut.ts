import { MenuItem } from ".";
import { dot } from "../../api";

export class Cut extends MenuItem {
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
            id: "cut",
            type: "item",
            category: "edit",

            label: "Cut",
            icon: "cut.svg",
            description:
                "Cut highlighted text to clipboard.",

            keybind: "CmdOrCtrl+X"
        });

        this.tabId = tabId;
        this.highlightedText = highlightedText;
    }
}
