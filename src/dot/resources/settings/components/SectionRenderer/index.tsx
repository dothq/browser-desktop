import React from "react";
import { useBrowserSelector } from "../../../../app/store/hooks";
import { Appearance } from "../../sections/appearance";
import { General } from "../../sections/general";

export const SectionRenderer = () => {
    const settings = useBrowserSelector(s => s.settings);

    return (
        <>
            {settings.selectedSection == "general" && <General />}
            {settings.selectedSection == "appearance" && <Appearance />}
        </>
    )
}