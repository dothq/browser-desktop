import { Section } from ".";
import { Appearance } from "./appearance";
import { General } from "./general";

export const sections: Record<string, Section> = {
    general: new General(),
    appearance: new Appearance()
};
