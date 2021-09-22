import { Section } from "..";

export class Gestures extends Section {
    public children = [

    ]

    public constructor() {
        super({
            id: "gestures",
            name: "Gestures",
            icon: "chrome://dot/content/skin/icons/gesture.svg"
        })
    }
}