import { Section } from ".";
import { General } from "./general";

export const sections: Record<string, Section> = {
    general: new General()
}