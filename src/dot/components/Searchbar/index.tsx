import React from "react"

export const Searchbar = () => {
    return (
        <div id={"urlbar"}>
            <div id={"urlbar-background"}></div>

            <div id={"urlbar-input-container"}>
                <span className={"identity-box"}>
                    <i className={"identity-icon"}></i>
                </span>
            </div>
        </div>
    )
}