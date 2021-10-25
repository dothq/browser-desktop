import { MenuItem } from ".";
import { dot } from "../../api";

export class Undo extends MenuItem {
    public tabId: number;
    public canUndo: boolean;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get disabled() {
        return !this.canUndo;
    }

    constructor({
        tabId,
        canUndo
    }: {
        tabId: number;
        canUndo: boolean;
    }) {
        super({
            id: "undo",
            type: "item",
            category: "edit",

            label: "Undo",
            icon: "undo.svg",
            description: "Undo what you just typed.",

            keybind: "CmdOrCtrl+Z"
        });

        this.tabId = tabId;
        this.canUndo = canUndo;
    }
}
