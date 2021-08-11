import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class Undo extends MenuItem {
    public tabId: number;
    public canUndo: boolean;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get disabled() {
        return !this.canUndo;
    }

    constructor({ tabId, canUndo }: { tabId: number, canUndo: boolean }) {
        super({
            id: "context-undo",
            type: "item",
            category: "edit",

            label: "Undo",
            icon: "undo.svg",
            description: "Undo what you just typed.",

            hotkey: new Hotkey("Ctrl", "Z")
        })

        this.tabId = tabId;
        this.canUndo = canUndo;
    }
}