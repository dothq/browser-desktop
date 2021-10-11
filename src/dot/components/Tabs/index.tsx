import React, { useEffect, useRef } from "react";
import { Transition } from "react-transition-group";
import { dot } from "../../api";
import { useBrowserSelector } from "../../app/store/hooks";
import { ipc } from "../../core/ipc";
import { TabPreview } from "../../core/tab-preview";
import { Tab } from "../../models/Tab";
import { BrowserTab } from "../Tab";

export const Tabs = () => {
    const tabs = useBrowserSelector((s: any) => s.tabs);

    const tabsContainer = useRef<HTMLDivElement>(null);

    const [tabPreviewVisible, setTabPreviewVisible] =
        React.useState(false);
    const [tabPreviewX, setTabPreviewX] =
        React.useState(0);
    const [tabPreviewAssosiate, setTabPreviewAssosiate] =
        React.useState<Tab>();

    const [globalDrag, setGlobalDrag] =
        React.useState(false);
    const [individualDrag, setIndividualDrag] =
        React.useState(false);

    let mouseEventInt: NodeJS.Timeout;

    const onTabMouseEnter = (tab: Tab) => {
        clearTimeout(mouseEventInt);

        const tabElement = document.getElementById(
            `tab-${tab.id}`
        );

        if (tabElement) {
            const bounds =
                tabElement.getBoundingClientRect();

            setTabPreviewX(bounds.left);
        }

        mouseEventInt = setTimeout(() => {
            setTabPreviewVisible(true);
            setTabPreviewAssosiate(tab);
        }, 200);
    };

    const onTabMouseLeave = () => {
        clearTimeout(mouseEventInt);
        setTabPreviewVisible(false);
    };

    // Show tabs if there is more than one
    useEffect(() => {
        const tabBar = document.getElementById("tab-bar");

        if (tabs.list.length > 1) {
            tabBar?.setAttribute(
                "style",
                "margin-top: 0;"
            );
        } else {
            tabBar?.setAttribute("style", "");
        }
    }, [tabs]);

    useEffect(() => {
        // Listen for drag state changes
        ipc.on("tab-drag-target-change", (drag) =>
            setIndividualDrag(drag.data)
        );
    });

    return (
        <div
            id={"tabbrowser-tabs"}
            onMouseLeave={onTabMouseLeave}
            ref={tabsContainer}
            onDrag={(e) => {
                e.preventDefault();
                setGlobalDrag(true);
            }}
            onDragEnd={(e) => {
                e.preventDefault();
                setGlobalDrag(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                setGlobalDrag(false);

                dot.tabs.relocateTab(
                    Number(
                        e.dataTransfer.getData("tab_id")
                    ),
                    dot.tabs.list.length - 1
                );
            }}
        >
            <Transition
                in={tabPreviewVisible}
                timeout={200}
            >
                {(stage) => (
                    <TabPreview
                        tab={tabPreviewAssosiate}
                        stage={stage}
                        x={tabPreviewX}
                        y={
                            tabsContainer.current?.getBoundingClientRect()
                                .top || 0
                        }
                    />
                )}
            </Transition>

            {tabs.list.map((tab: Tab, index: number) => (
                <BrowserTab
                    key={tab.id}
                    tab={tab}
                    onMouseEnter={() =>
                        onTabMouseEnter(tab)
                    }
                    nextIsActive={
                        tabs.list[index + 1]
                            ? tabs.list[index + 1].active
                            : false
                    }
                />
            ))}

            {globalDrag && !individualDrag && (
                <div
                    className="dragHover"
                    style={{
                        width: 2,
                        backgroundColor:
                            "var(--dot-ui-accent-colour)"
                    }}
                ></div>
            )}
        </div>
    );
};
