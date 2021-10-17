import { Section } from "..";
import { SearchSettings } from "./settings";

export class Search extends Section {
    public id = "search";
    public name = "Search";
    public icon =
        "chrome://dot/content/skin/icons/search.svg";

    public children = [
        {
            title: "Searching and results",
            element: SearchSettings
        }
    ];
}
