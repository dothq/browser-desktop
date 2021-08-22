import React from "react";
import { dot } from "../../api";
import { store } from "../../app/store";

export const Statusbar = () => {
    const [status, setStatus] = React.useState("");

    store.subscribe(() => {
        const { selectedTab } = dot.tabs;

        setStatus(selectedTab?.pageStatus || "")
    })

    return (
        <div className={"navigator-statusbar"}>
            <span className={"statusbar-status"}>
                {status}
            </span>
        </div>
    )
}