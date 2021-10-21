import { Section } from ".";
import { Appearance } from "./appearance";
import { Search } from "./search";

export const sections: Record<string, Section> = {
    // general: new General(),
    appearance: new Appearance(),
    search: new Search()
};
