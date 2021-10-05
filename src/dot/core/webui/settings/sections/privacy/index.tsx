import { Section } from "..";

export class Privacy extends Section {
    public children = [];

    public constructor() {
        super({
            id: "privacy-and-security",
            name: "Privacy and Security",
            icon: "chrome://dot/content/skin/icons/identity/https.svg"
        });
    }
}
