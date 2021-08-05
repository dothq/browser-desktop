import React from "react";
import { RadioGroup } from 'react-radio-group';
import { dot } from "../../../../api";
import { Button } from "../../../shared/components/Button";
import { ButtonGroup } from "../../../shared/components/ButtonGroup";
import { Checkbox } from "../../../shared/components/Checkbox";
import { Radio } from "../../../shared/components/Radio";
import { Section } from "../../../shared/components/Section";
import { Subsection } from "../../../shared/components/Subsection";
import { AccentColourPicker } from "../../components/AccentColourPicker";
import { Item } from "../../components/Item";
import { ThemePicker } from "../../components/ThemePicker";

export const Appearance = () => {
    const [selectedThemeSchedule, setSelectedTS] = React.useState("time");

    return (
        <Section title={"Appearance"}>
            <Subsection subtitle={"Themes"}>
                <ThemePicker />

                <ButtonGroup>
                    <Button
                        label={"Edit Theme"}
                        primary
                        style={{ width: "max-content" }}
                        onClick={() => dot.settings.selectedSection = "appearance.theme-editor"} />
                    <Button
                        icon={"chrome://dot/content/skin/icons/rubbish.svg"}
                        danger
                        style={{ width: "max-content" }}
                    />
                </ButtonGroup>

                <Item
                    left={(<>
                        <strong>Accent colour</strong>
                        <p>
                            Personalise your browsing experience with an accent colour.
                        </p>

                        <AccentColourPicker />
                    </>)}
                />

                <Item
                    left={(<>
                        <strong>Apply this theme to</strong>

                        <Checkbox spaced id={"reader-mode-theme"} label={"Reader Mode"} />
                        <Checkbox spaced id={"devtools-theme"} label={"Developer Tools"} />
                        <Checkbox spaced id={"private-browsing-theme"} label={<>
                            {"Private Browsing"}
                            <p>Using Private Theme for Private Windows</p>
                        </>} />
                    </>)}
                />

                <Item
                    left={(<>
                        <strong>Theme schedule</strong>
                        <p>
                            Adjust the theme to be more appropriate at certain times.
                        </p>

                        <RadioGroup
                            style={{ maxWidth: "400px" }}
                            selectedValue={selectedThemeSchedule}
                            onChange={(value) => setSelectedTS(value)}
                        >
                            <Radio
                                group={"theme-schedule"}
                                id={"no-schedule"}
                                label={"No Schedule"}
                                value={"none"}
                                spaced
                            />

                            <Radio
                                group={"theme-schedule"}
                                id={"system-theme-schedule"}
                                label={<>
                                    {"Use system theme"}
                                    <p>Dot Browser will switch between “Light” and “Dark” whenever your system theme changes.</p>
                                </>}
                                value={"system"}
                                spaced
                            />

                            <Radio
                                group={"theme-schedule"}
                                id={"time-schedule"}
                                label={<>
                                    {"Use a time schedule"}
                                    <p>Dot Browser will switch to “Dark” at 18:00 and “Light” at 06:00.</p>
                                </>}
                                value={"time"}
                                spaced
                            />
                        </RadioGroup>
                    </>)}
                />
            </Subsection>
        </Section>
    );
}