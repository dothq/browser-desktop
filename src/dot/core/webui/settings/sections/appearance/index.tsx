import { Section } from "..";

export class Appearance extends Section {
    public children = [

    ]

    public constructor() {
        super({
            id: "appearance",
            name: "Appearance",
            icon: "chrome://dot/content/skin/icons/customise.svg"
        })
    }
}