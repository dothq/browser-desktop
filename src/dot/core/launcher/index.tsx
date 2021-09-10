import React from "react";
import { Transition, TransitionStatus } from "react-transition-group";
import { store } from "../../app/store";
import { useBrowserSelector } from "../../app/store/hooks";
import { Group } from "./components/Group";
import { GroupItem } from "./components/GroupItem";

const stubData = {
    recents: [
        { title: "Go Back", icon: "chrome://dot/content/skin/icons/back.svg" },
        { title: "Go Forward", icon: "chrome://dot/content/skin/icons/forward.svg" },
        { title: "Reload", icon: "chrome://dot/content/skin/icons/reload.svg" },
        { title: "Take Screenshot", icon: "chrome://dot/content/skin/icons/screenshot.svg" }
    ]
}

const animation: Partial<Record<TransitionStatus, any>> = {
    entering: {
        opacity: 0,
        transform: "scale(0.95)"
    },
    entered: {
        opacity: 1,
        transform: "scale(1)"
    },
    exiting: {
        opacity: 0,
        transform: "scale(0.95)"
    },
    exited: {
        opacity: 0,
        transform: "scale(0.95)"
    }
}

export const Launcher = () => {
    const ui = useBrowserSelector(state => state.ui);

    const ref = React.createRef<HTMLInputElement>();
    const scrollableRef = React.createRef<HTMLDivElement>();

    const [expanded, setExpanded] = React.useState(false);

    const [highlightY, setHighlightY] = React.useState(0);

    const checkValue = () => {
        if (!ref.current || !ui.launcherVisible) return;

        scrollableRef.current?.scrollTo({ left: 0, top: 0 });

        if (ref.current.value.length <= 0) setExpanded(false);
        else setExpanded(true);
    }

    React.useEffect(() => {
        document.addEventListener("keypress", (e) => {
            const state = store.getState();

            if (state.ui.launcherVisible) {
                if (e.key == "Escape") {
                    store.dispatch({
                        type: "UI_TOGGLE_LAUNCHER",
                        payload: false
                    })
                }
            }
        })
    }, []);

    React.useEffect(() => {
        checkValue();

        ref.current?.focus();
    }, [ui.launcherVisible]);

    return (
        <Transition in={ui.launcherVisible} timeout={200}>
            {stage => (
                <div
                    className={"launcher-wrapper"}
                    style={{
                        display: (stage == "exited" && !ui.launcherVisible)
                            ? "none"
                            : "",
                        ...animation[stage]
                    }}
                    data-expanded={expanded}
                >
                    <div
                        className={"launcher-popup"}
                    >
                        <div className={"launcher-popup-input"}>
                            <i className={"launcher-popup-input-icon"}></i>

                            <input
                                className={"launcher-popup-input-box"}
                                type="text"
                                ref={ref}
                                onChange={checkValue}
                                autoFocus
                                placeholder={"Search the web, links, commands and browsing data"}
                            ></input>
                        </div>
                    </div>

                    <div className={"launcher-popup-results"}>
                        <div className={"launcher-popup-results-container"} ref={scrollableRef}>
                            {Object.entries(stubData).map(([key, value]: any) => (
                                <Group id={key} heading={key}>
                                    {value.map((item: any, i: any) => (
                                        <GroupItem
                                            key={i}
                                            title={item.title}
                                            subtitle={item.subtitle}
                                            icon={item.icon}
                                            onMouseOver={(e: any) => {
                                                const bounds = e.target.getBoundingClientRect();

                                                setHighlightY(bounds.top);
                                            }}
                                        />
                                    ))}
                                </Group>
                            ))}

                            <div
                                className={"launcher-popup-results-container-highlight"}
                                style={{ transform: `translateY(${highlightY}px)` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </Transition>

    )
}