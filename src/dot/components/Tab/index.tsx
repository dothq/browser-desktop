import React from "react"
import { store } from "../../app/store"
import { Tab } from "../../models/Tab"
import { ToolbarButton } from "../ToolbarButton"

export const BrowserTab = ({ tab }: { tab: Tab }) => {
    return (
        <div
            className={"tabbrowser-tab"}
            data-active={tab.active}
            onMouseDown={() => store.dispatch({ type: "TAB_SELECT", payload: tab.id })}
        >
            <div className={"tab-background"}></div>

            <div className={"tab-content"}>
                <i
                    className={"tab-icon-stack"}
                    data-state={tab.state}
                    style={{ backgroundImage: `url(page-icon:${tab.url})` }}
                ></i>

                <span className={"tab-label-container"}>
                    <label className={"tab-text tab-label"}>{tab.state == "loading"
                        ? "Loading..."
                        : tab.state == "idle" && tab.title
                            ? tab.title
                            : "Untitled"}</label>
                </span>

                <ToolbarButton
                    className={"tab-close-button close-icon"}
                    image={"chrome://dot/content/skin/icons/close.svg"}
                    onClick={() => store.dispatch({
                        type: "TAB_CLOSE",
                        payload: tab.id
                    })}
                />
            </div>
        </div>
    )
}