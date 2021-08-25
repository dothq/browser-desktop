import { dot } from "../../api";

export class SearchSuggestion {
    public id: string;

    public title: string = "";
    public titleSuffix?: string = "";
    public subtitle?: string = "";
    public icon: string = "";
    public url: string = "";

    constructor(args: Partial<SearchSuggestion>) {
        this.id = dot.utilities.makeID(2);

        for (const [key, value] of Object.entries(args)) {
            (this as any)[key] = value;
        }
    }
}