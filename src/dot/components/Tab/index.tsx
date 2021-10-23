import { observer } from "mobx-react";
import React from "react";
import { Tab } from "../../models/Tab";
import { ToolbarButton } from "../ToolbarButton";
import { TabBackground } from "./components/TabBackground";

interface Props {
    tab: Tab
}

const TabButton = observer((args: any) => {
    return (
        <ToolbarButton
            {...args}
            className={args.className 
                ? `tab-action-button ${args.className}` 
                : "tab-action-button"
            }
        />
    )
});

export const BrowserTab = observer(({ tab }: Props) => {
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
                data-audio-playing={tab.audioPlaying}
                data-audio-playback-blocked={tab.audioPlaybackBlocked}
                data-muted={tab.muted}
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

                <div className={"tab-actions"}>
                    <TabButton
                        image={tab.muted
                            ? "chrome://dot/content/skin/icons/audio-muted.svg"
                            : "chrome://dot/content/skin/icons/audio.svg"
                        }
                        onClick={() => tab.toggleMute()}
                        hidden={!tab.audioPlaying}
                    />

                    <TabButton
                        image={"chrome://dot/content/skin/icons/close.svg"}
                        onMouseDown={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onMouseUp={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();

                            tab.destroy();
                        }}
                    />
                </div>
            </div>
        </div>
    )
});