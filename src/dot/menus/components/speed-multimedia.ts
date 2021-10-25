import { MenuItem } from ".";
import { dot } from "../../api";

type PlaybackSpeed =
    | 0.25
    | 0.5
    | 0.75
    | 1.0
    | 1.25
    | 1.5
    | 1.75
    | 2
    | 3
    | 5
    | 10;

export class Speed extends MenuItem {
    public tabId: number;
    public speed: PlaybackSpeed;

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public get submenu() {
        let menu = [];

        const options: PlaybackSpeed[] = [
            0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2, 3,
            5, 10
        ];

        for (const option of options) {
            menu.push(
                new MenuItem({
                    label: `${option}x`,
                    type: "radio",
                    selected: this.speed == option
                })
            );
        }

        return menu;
    }

    constructor({
        tabId,
        speed
    }: {
        tabId: number;
        speed: PlaybackSpeed;
    }) {
        super({
            id: "speedmedia",
            type: "submenu",
            category: "multimedia",

            label: "Speed",
            description:
                "Change playback speed of the media."
        });

        this.tabId = tabId;
        this.speed = speed;
    }
}
