import { MenuItem } from ".";
import { dot } from "../../api";
import { Hotkey } from "../hotkey";

export class Redo extends MenuItem {
    public tabId: number;
    public canRedo: boolean;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get disabled() {
        return !this.canRedo;
    }

    constructor({
        tabId,
        canRedo
    }: {
        tabId: number;
        canRedo: boolean;
    }) {
        super({
            id: "context-redo",
            type: "item",
            category: "edit",

            label: "Redo",
            icon: "redo.svg",
            description: "Redo what you just typed.",

            hotkey: new Hotkey("Ctrl", "Shift", "Z")
        });

        this.tabId = tabId;
        this.canRedo = canRedo;
    }
}
