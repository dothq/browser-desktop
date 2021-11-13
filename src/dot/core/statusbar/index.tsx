import React from "react";

export const Statusbar = () => {
    return (
        <div id={"navigator-statusbar"} hidden={true}>
            <span className={"statusbar-status"}>
                {status}
            </span>
        </div>
    );
};
