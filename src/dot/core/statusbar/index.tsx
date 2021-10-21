import React from "react";

export const Statusbar = () => {
    const [status, setStatus] = React.useState("");

    return (
        <div className={"navigator-statusbar"}>
            <span className={"statusbar-status"}>
                {status}
            </span>
        </div>
    );
};
