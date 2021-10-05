import { Section } from "..";

export class Search extends Section {
    public children = [];

    public constructor() {
        super({
            id: "search",
            name: "Search",
            icon: "chrome://dot/content/skin/icons/search.svg"
        });
    }
}
