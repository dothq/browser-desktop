import { MenuItem } from ".";
import { dot } from "../../api";

export class Play extends MenuItem {
    public tabId: number;
    public playing: boolean;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get label() {
        return this.playing ? "Pause" : "Play";
    }

    constructor({
        tabId,
        playing
    }: {
        tabId: number;
        playing: boolean;
    }) {
        super({
            id: "playmedia",
            type: "item",
            category: "multimedia",

            description: "Toggle playback of the media."
        });

        this.tabId = tabId;
        this.playing = playing;
    }
}
