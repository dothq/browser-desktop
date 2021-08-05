import React from "react";
import { useBrowserSelector } from "../../../../app/store/hooks";
import { Appearance } from "../../sections/appearance";
import { General } from "../../sections/general";
import { ThemeEditor } from "../ThemeEditor";

export const SectionRenderer = () => {
    const settings = useBrowserSelector(s => s.settings);

    return (
        <>
            {settings.selectedSection == "general" && <General />}
            {settings.selectedSection == "appearance" && <Appearance />}
            {settings.selectedSection == "appearance.theme-editor" && <ThemeEditor />}
        </>
    )
}