import { Section } from "..";

export class StartPage extends Section {
    public children = [

    ]

    public constructor() {
        super({
            id: "start-page",
            name: "Start Page",
            icon: "chrome://dot/content/skin/icons/navigate.svg"
        })
    }
}