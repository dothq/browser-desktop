import { Section } from "..";

export class Language extends Section {
    public children = [

    ]

    public constructor() {
        super({
            id: "language-and-region",
            name: "Language and Region",
            icon: "chrome://dot/content/skin/icons/language.svg"
        })
    }
}