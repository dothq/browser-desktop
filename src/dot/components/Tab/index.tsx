import React from "react";
import { Tab } from "../../models/Tab";
import { ToolbarButton } from "../ToolbarButton";
import { TabBackground } from "./components/TabBackground";

interface Props {
    tab: Tab
}

export const BrowserTab = ({ tab }: Props) => {
    return (
        <div className={"tabbrowser-tab-wrapper"}>
            <div 
                className={"tabbrowser-tab"}
                id={`tab-${tab.id}`}
                data-hover={tab.hovering}
                data-active={tab.active}
                data-url={tab.url}
                data-hostname={tab.host}
                data-id={tab.id}
                data-favicon={tab.faviconUrl}
                data-pendingicon={tab.pendingIcon}
                data-pinned={tab.pinned}
                data-state={tab.state}
                data-bookmarked={tab.bookmarked}
                data-can-go-back={tab.canGoBack}
                data-can-go-forward={tab.canGoForward}
                data-zoom={tab.zoom}
                title={tab.tooltip}
                onMouseOver={(e) => tab.onTabMouseOver()}
                onMouseLeave={(e) => tab.onTabMouseLeave()}
                onMouseDown={(e) => tab.onTabMouseDown(e)}
            >
                <TabBackground />

                <div 
                    className={"tab-content"}
                >
                    <i 
                        className={`tab-favicon ${tab.state == "idle"
                            ? !!(tab.faviconUrl && tab.faviconUrl) || tab.pendingIcon
                                ? ""
                                : "hidden"
                            : "loading"}`}
                        style={{
                            backgroundImage: tab.state == "idle" && !!(tab.faviconUrl && tab.faviconUrl.length)
                                ? `url(${tab.faviconUrl})`
                                : ``
                        }}
                        data-loading-stage={tab.loadingStage.length ? tab.loadingStage : undefined}
                    />

                    <span className={"tab-title"}>
                        {tab.title}
                    </span>
                </div>

                <ToolbarButton
                    className={"tab-close-button"}
                    image={"chrome://dot/content/skin/icons/close.svg"}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />
            </div>
        </div>
    )
}