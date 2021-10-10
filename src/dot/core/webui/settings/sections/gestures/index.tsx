import { Section } from "..";

export class Sync extends Section {
    public children = [];

    public constructor() {
        super({
            id: "sync",
            name: "Sync",
            icon: "chrome://dot/content/skin/icons/sync.svg"
        });
    }
}
