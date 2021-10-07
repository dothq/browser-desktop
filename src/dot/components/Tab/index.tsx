import React, { useState } from "react";
import { dot } from "../../api";
import { store } from "../../app/store";
import { ipc } from "../../core/ipc";
import { Tab } from "../../models/Tab";
import { openMenuAt } from "../../shared/menu";
import { TAB_LOADING_ICON_URL } from "../../shared/tab";
import { ToolbarButton } from "../ToolbarButton";

export const BrowserTab = ({
    tab,
    nextIsActive,
    onMouseEnter,
    onMouseLeave
}: {
    tab: Tab;
    nextIsActive: boolean;
    onMouseEnter?: any;
    onMouseLeave?: any;
}) => {
    const [drag, setDrag] = useState(false);

    const onCloseClick = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        tab.destroy();
    };

    return (
        <>
            {drag && (
                <div
                    className="dragHover"
                    style={{
                        width: 2,
                        backgroundColor:
                            "var(--dot-ui-accent-colour)"
                    }}
                ></div>
            )}

            <div
                id={`tab-${tab.id}`}
                className={"tabbrowser-tab"}
                data-active={tab.active}
                data-next-active={nextIsActive}
                data-closing={tab.isClosing}
                draggable={true}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                data-id={tab.id}
                data-title={tab.title || ""}
                data-url={tab.url || ""}
                onMouseDown={(e) => {
                    if (e.button == 0) {
                        store.dispatch({
                            type: "TAB_SELECT",
                            payload: tab.id
                        });

                        // Tell other components (e.g. the search bar) that they
                        // should really update. We cant run this inside of
                        // redux :(
                        ipc.fire("tab-change", tab.id);
                    }
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    openMenuAt({
                        name: "TabMenu",
                        bounds: [e.clientX, e.clientY],
                        ctx: { tabId: tab.id }
                    });
                }}
                onDragStart={(e) => {
                    e.dataTransfer.setData(
                        "tab_id",
                        tab.id.toString()
                    );
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                }}
                onDragExit={(e) => {
                    e.preventDefault();
                    setDrag(false);
                }}
                onDrop={(e) => {
                    setDrag(false);

                    const thisTabIndex =
                        dot.tabs.list.findIndex(
                            (t) => t.id == tab.id
                        );

                    const dragTabId = Number(
                        e.dataTransfer.getData("tab_id")
                    );
                    const dragTabIndex =
                        dot.tabs.list.findIndex(
                            (t) => t.id == dragTabId
                        );

                    store.dispatch({
                        type: "RELOCATE_TAB",
                        payload: {
                            oldIndex: dragTabIndex,
                            newIndex: thisTabIndex
                        }
                    });
                }}
            >
                <div className={"tab-background"}></div>

                <div className={"tab-content"}>
                    <i
                        className={"tab-icon-stack"}
                        data-icon-hidden={
                            tab.initialIconHidden
                        }
                        style={{
                            backgroundImage:
                                tab.state == "idle"
                                    ? tab.faviconUrl
                                        ? `url(${tab.faviconUrl})`
                                        : ``
                                    : `url(${TAB_LOADING_ICON_URL})`
                        }}
                    ></i>

                    <span
                        className={"tab-label-container"}
                    >
                        <label
                            className={
                                "tab-text tab-label"
                            }
                        >
                            {tab.title
                                ? tab.title
                                : tab.url ==
                                      "about:blank" &&
                                  tab.state == "loading"
                                ? "Loading…"
                                : tab.url}
                        </label>
                    </span>

                    <ToolbarButton
                        className={
                            "tab-close-button close-icon"
                        }
                        image={
                            "chrome://dot/content/skin/icons/close.svg"
                        }
                        onMouseDown={(e: MouseEvent) =>
                            e.stopPropagation()
                        }
                        onMouseUp={(e: MouseEvent) =>
                            onCloseClick(e)
                        }
                    />
                </div>
            </div>
        </>
    );
};
