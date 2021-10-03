import { Section } from "..";
import { Theme } from "./theme";

export class Appearance extends Section {
    public children = [
        Theme
    ]

    public constructor() {
        super({
            id: "appearance",
            name: "Appearance",
            icon: "chrome://dot/content/skin/icons/customise.svg"
        })
    }
}