import { Section } from "..";

export class About extends Section {
    public children = [];

    public constructor() {
        super({
            id: "about",
            name: "About Dot Browser",
            icon: "chrome://dot/content/skin/icons/identity/info.svg"
        });
    }
}
