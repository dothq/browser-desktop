import { MenuItem } from ".";
import { dot } from "../../api";

export class Loop extends MenuItem {
    public tabId: number;
    public looped: boolean;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    constructor({ tabId, looped }: { tabId: number, looped: boolean }) {
        super({
            id: "context-loopmedia",
            type: "checkbox",
            category: "multimedia",

            label: "Loop",
            selected: looped,
            description: "Enable looping of the media."
        })

        this.tabId = tabId;
        this.looped = looped;
    }
}