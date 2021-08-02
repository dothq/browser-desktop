import React from "react";
import { Button } from "../../../shared/components/Button";
import { Checkbox } from "../../../shared/components/Checkbox";
import { Section } from "../../../shared/components/Section";
import { Subsection } from "../../../shared/components/Subsection";
import { Item } from "../../components/Item";

export const General = () => {
    return (
        <Section title={"General"}>
            <Subsection subtitle={"Profiles"}>

            </Subsection>

            <Subsection subtitle={"Start-up"}>
                <Item
                    left={<>
                        Dot Browser is not your default browser.
                    </>}
                    right={<Button
                        primary
                        label={"Make Default"}
                    />}
                />

                <Item
                    left={<>
                        <Checkbox
                            id={"restore-previous-session"}
                            label={"Restore previous session"}
                        />
                    </>}
                />
            </Subsection>
        </Section>
    );
}