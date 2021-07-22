import React from "react"
import { store } from "../../app/store"
import { Tab } from "../../models/Tab"
import { ToolbarButton } from "../ToolbarButton"

export const BrowserTab = ({ tab, nextIsActive }: { tab: Tab, nextIsActive: boolean }) => {
    return (
        <div
            className={"tabbrowser-tab"}
            data-active={tab.active}
            data-next-active={nextIsActive}
            onMouseDown={() => store.dispatch({ type: "TAB_SELECT", payload: tab.id })}
        >
            <div className={"tab-background"}></div>

            <div className={"tab-content"}>
                <i
                    className={"tab-icon-stack"}
                    style={{
                        backgroundImage: tab.state == "idle"
                            ? `url(${tab.faviconUrl})`
                            : `url(chrome://browser/skin/tabbrowser/tab-loading@2x.png)`
                    }}
                ></i>

                <span className={"tab-label-container"}>
                    <label className={"tab-text tab-label"}>{tab.title
                        ? tab.title
                        : tab.url == "about:blank" && tab.state == "loading"
                            ? "Loading…"
                            : tab.url}</label>
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