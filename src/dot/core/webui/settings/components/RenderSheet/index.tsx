import React from "react";
import { Section } from "../../sections";
import { sections } from "../../sections/sections";
import { useSettingsSelector } from "../../store/hooks";
import { Card } from "../Card";

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
            <h2>{section?.name}</h2>

            {section &&
                section.children?.map((child, index) => (
                    <React.Fragment key={index}>
                        <Card title={child.title}>
                            <child.element />
                        </Card>
                    </React.Fragment>
                ))}
        </div>
    );
};
