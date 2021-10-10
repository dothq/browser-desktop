import { Section } from "..";
import { SearchSettings } from "./settings";

export class Search extends Section {
    public children = [SearchSettings];

    public constructor() {
        super({
            id: "search",
            name: "Search",
            icon: "chrome://dot/content/skin/icons/search.svg"
        });
    }
}
