import React from "react";
import { ToolbarButton } from "../ToolbarButton";

export const NewTabButton = ({ variant }: { variant: 'tab-bar' | 'navigation-bar' }) => (
    <ToolbarButton
        id={"new-tab-button"}
        className={`new-tab-${variant}-variant`}
        image={"chrome://dot/content/skin/icons/add.svg"}
        command={"Browser:NewTab"}
    />
)