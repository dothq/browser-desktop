import React from "react";
import { Section } from "../../sections";
import { sections } from "../../sections/sections";
import { useSettingsSelector } from "../../store/hooks";

export const RenderSheet = () => {
    const reactiveStore = useSettingsSelector(
        (s: any) => s
    );

    const [section, setSection] =
        React.useState<Section>();

    React.useEffect(() => {
        setSection(
            sections[
                reactiveStore.settings.selectedSectionId
            ]
        );
    }, [reactiveStore.settings.selectedSectionId]);

    return (
        <div className={"settings-mount"}>
            {section &&
                section.children?.map((Child, index) => (
                    <React.Fragment key={index}>
                        {<Child />}
                    </React.Fragment>
                ))}
        </div>
    );
};
