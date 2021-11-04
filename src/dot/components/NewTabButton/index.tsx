import { observer } from "mobx-react";
import React from "react";
import { ToolbarButton } from "../ToolbarButton";

export const NewTabButton = observer(() => (
    <ToolbarButton
        image={"chrome://dot/content/skin/icons/add.svg"}
        command={"Browser:NewTab"}
    />
));
