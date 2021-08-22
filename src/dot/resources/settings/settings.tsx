import React from "react";
import ReactDOM from "react-dom";
import { Sidebar } from "./components/Sidebar";

export const Settings = () => {
    return (
        <>
            about:settings
        </>
    )
}

export const Config = () => {
    return (
        <>
            <Sidebar title={"Config"}>

            </Sidebar>
        </>
    )
}

ReactDOM.render(
    window.location.pathname == "settings"
        ? <Settings />
        : <Config />,
    document.getElementById(window.location.pathname)
)