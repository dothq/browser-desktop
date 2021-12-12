import { observer } from "mobx-react";
import React from "react";
import { kAddIcon } from "../../core/icons";
import { ToolbarButton } from "../ToolbarButton";

export const NewTabButton = observer(() => {
    return (
        <ToolbarButton
            id={"new-tab-button"}
            image={kAddIcon}
            command={"Browser:NewTab"}
        />
    )
});
