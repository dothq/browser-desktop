import { observer } from "mobx-react";
import React from "react";
import { Tab } from "../../models/Tab";
import { isBlankPageURL } from "../../shared/url";
import { ToolbarButton } from "../ToolbarButton";
import { TabBackground } from "./components/TabBackground";

interface Props {
    tab: Tab;
}

const TabButton = observer((args: any) => {
    return (
        <ToolbarButton
            {...args}
            className={
                args.className
                    ? `tab-action-button ${args.className}`
                    : "tab-action-button"
            }
        />
    );
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
                data-favicon={
                    tab.shouldHideIcon
                        ? null
                        : tab.faviconUrl
                }
                data-pendingicon={tab.pendingIcon}
                data-pinned={tab.pinned}
                data-state={tab.state}
                data-bookmarked={tab.bookmarked}
                data-can-go-back={tab.canGoBack}
                data-can-go-forward={tab.canGoForward}
                data-audio-playing={tab.audioPlaying}
                data-audio-playback-blocked={
                    tab.audioPlaybackBlocked
                }
                data-muted={tab.muted}
                data-zoom={tab.zoom}
                data-should-hide-icon={tab.shouldHideIcon}
                data-closing={tab.isClosing}
                title={tab.tooltip}
                onMouseOver={(e) => tab.onTabMouseOver()}
                onMouseLeave={(e) =>
                    tab.onTabMouseLeave()
                }
                onMouseDown={(e) => tab.onTabMouseDown(e)}
            >
                <TabBackground />

                <div className={"tab-content"}>
                    <div
                        className={`tab-icon-container ${
                            tab.state == "idle" &&
                            !tab.pendingIcon
                                ? !tab.shouldHideIcon ||
                                tab.pendingIcon
                                    ? ""
                                    : "hidden"
                                : !isBlankPageURL(tab.url)
                                ? "loading"
                                : "hidden"
                        }`}
                    >
                        <i
                            className={"tab-favicon"}
                            style={{
                                backgroundImage:
                                    tab.state == "idle"
                                        ? `url(${tab.faviconUrl})`
                                        : ``
                            }}
                            data-loading-stage={
                                tab.pendingIcon
                                    ? "progress"
                                    : tab.loadingStage
                                        .length
                                    ? tab.loadingStage
                                    : undefined
                            }
                        />
                    </div>

                    <span className={"tab-title"}>
                        {tab.title}
                    </span>
                </div>

                <div className={"tab-actions"}>
                    <TabButton
                        image={
                            tab.muted
                                ? "chrome://dot/content/skin/icons/audio-muted.svg"
                                : "chrome://dot/content/skin/icons/audio.svg"
                        }
                        onClick={() => tab.toggleMute()}
                        hidden={!tab.audioPlaying}
                    />

                    <TabButton
                        image={
                            "chrome://dot/content/skin/icons/close.svg"
                        }
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
    );
});
