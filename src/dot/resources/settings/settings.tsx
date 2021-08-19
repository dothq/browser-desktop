import React from "react";
import ReactDOM from "react-dom";

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
            about:config
        </>
    )
}

ReactDOM.render(
    window.location.pathname == "settings"
        ? <Settings />
        : <Config />,
    document.getElementById(window.location.pathname)
)