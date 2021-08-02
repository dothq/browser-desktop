import React from "react";
import { Section } from "../../../shared/components/Section";
import { Subsection } from "../../../shared/components/Subsection";
import { AccentColourPicker } from "../../components/AccentColourPicker";
import { Item } from "../../components/Item";
import { ThemePicker } from "../../components/ThemePicker";

export const Appearance = () => {
    return (
        <Section title={"Appearance"}>
            <Subsection subtitle={"Themes"}>
                <ThemePicker />

                <Item
                    left={(<>
                        <strong>Accent colour</strong>
                        <p>
                            Personalise your browsing experience with an accent colour.
                        </p>

                        <AccentColourPicker />
                    </>)}
                />
            </Subsection>
        </Section>
    );
}