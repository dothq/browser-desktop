import React from "react";
import { Transition, TransitionStatus } from "react-transition-group";
import { dot } from "../../api";
import { store } from "../../app/store";
import { useBrowserSelector } from "../../app/store/hooks";
import { Group } from "./components/Group";
import { GroupItem } from "./components/GroupItem";

const id = () => dot.utilities.makeID(1);

const stubData = {
    recents: [
        { id: "go-back", title: "Go Back", icon: "chrome://dot/content/skin/icons/back.svg" },
        { id: "go-forward", title: "Go Forward", icon: "chrome://dot/content/skin/icons/forward.svg" },
        { id: "reload", title: "Reload", icon: "chrome://dot/content/skin/icons/reload.svg" },
        { id: "take-screenshot", title: "Take Screenshot", icon: "chrome://dot/content/skin/icons/screenshot.svg" }
    ],
    history: [
        { id: id(), title: "GitHub", subtitle: "github.com", icon: "page-icon:https://github.com/" },
        { id: id(), title: "Twitter", subtitle: "twitter.com", icon: "page-icon:https://twitter.com/" },
        { id: id(), title: "Dot HQ", subtitle: "www.dothq.co", icon: "page-icon:https://www.dothq.co/" },
        { id: id(), title: "Reddit", subtitle: "reddit.com", icon: "page-icon:https://reddit.com/" },
        { id: id(), title: "Figma", subtitle: "figma.com", icon: "page-icon:https://figma.com/" },
        { id: id(), title: "Site", subtitle: "example.com", icon: "page-icon:https://example.com/" },
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

enum LauncherKeyboardMovement {
    Up,
    Down
}

export const Launcher = () => {
    const ui = useBrowserSelector(state => state.ui);

    const ref = React.createRef<HTMLInputElement>();
    const scrollableRef = React.createRef<HTMLDivElement>();

    const [expanded, setExpanded] = React.useState(false);

    const [highlightY, setHighlightY] = React.useState(0);
    const [active, setActive] = React.useState("");

    const checkValue = () => {
        if (!ref.current || !ui.launcherVisible) return;

        scrollableRef.current?.scrollTo({ left: 0, top: 0 });
    }

    let exitTimeout: any;

    const doKeyboardHighlightMovement = (movement: number) => {
        console.log("movement", movement);
        console.log("active", active);

        const split = active.split("-")
        const group = split[0];

        const currentHighlighted = document.getElementById(`result-${active}`);
        const highlightedParent = currentHighlighted?.parentElement;
        const parentNodes = highlightedParent?.childNodes;

        if (
            !currentHighlighted ||
            !highlightedParent ||
            !parentNodes
        ) return;

        const currentIndex = Array.from(
            parentNodes
        ).findIndex((i: any) => i.id == currentHighlighted.id) + 1;
        // We are adding 1 to the index as the nodes length doesn't start from 0

        console.log("currentIndex", currentIndex);

        const maxAmount = parentNodes.length;

        console.log("maxAmount", maxAmount);

        console.log("check",
            (movement == LauncherKeyboardMovement.Up
                ? (currentIndex + 1) <= maxAmount // Add one to the index
                : (currentIndex - 1) <= maxAmount // Subtract one from the index
            ) &&
            currentIndex >= 1
        );

        console.log("adding one to index", (currentIndex + 1) <= maxAmount);
        console.log("minus one from index", (currentIndex - 1) <= maxAmount);

        console.log("satisfies bounds", currentIndex >= 1);

        if (
            (movement == LauncherKeyboardMovement.Up
                ? (currentIndex + 1) <= maxAmount // Add one to the index
                : (currentIndex - 1) <= maxAmount // Subtract one from the index
            ) &&
            currentIndex >= 1
        ) {
            const nextIndex = currentIndex - 1;
            const nextId = parentNodes[nextIndex];

            setActive(`${group}-${nextId}`);
        } else {
            // We can't go any further in this group, let's try the next one.
        }
    }

    React.useEffect(() => {
        document.addEventListener("keypress", (e) => {
            const state = store.getState();

            if (state.ui.launcherVisible) {
                if (e.key == "Escape") {
                    clearTimeout(exitTimeout);
                    exitTimeout = null;

                    setExpanded(false);

                    exitTimeout = setTimeout(() => {
                        store.dispatch({
                            type: "UI_TOGGLE_LAUNCHER",
                            payload: false
                        })
                    }, 300);
                }
            }
        })
    }, []);

    React.useEffect(() => {
        checkValue();

        const firstCategoryId = Object.keys(stubData)[0];
        const firstItemInCategoryId = (stubData as any)[firstCategoryId][0].id;

        setActive(
            `${firstCategoryId}-${firstItemInCategoryId}`
        )

        ref.current?.focus();
    }, [ui.launcherVisible]);

    React.useEffect(() => {
        const element = document.getElementById(`result-${active}`);

        if (!element) return;

        const bounds = element.getBoundingClientRect();
        setHighlightY(bounds.top);
    }, [active])

    return (
        <Transition
            in={ui.launcherVisible}
            timeout={200}
            onEntered={() => setTimeout(() => {
                setExpanded(true)
            }, 200)}
        >
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
                        <div
                            className={"launcher-popup-results-container"}
                            ref={scrollableRef}
                            style={{
                                pointerEvents: stage == "entered" ? "all" : "none"
                            }}
                        >
                            {Object.entries(stubData).map(([key, value]: any) => (
                                <Group id={key} heading={key}>
                                    {value.map((item: any, i: any) => {
                                        const id = `${key}-${item.id}`;

                                        return <GroupItem
                                            key={i}
                                            id={`result-${id}`}
                                            title={item.title}
                                            subtitle={item.subtitle}
                                            icon={item.icon}
                                            active={active == id}
                                            onMouseEnter={(e: any) => {
                                                e.stopPropagation();
                                                e.preventDefault();

                                                setActive(id);
                                            }}
                                        />
                                    })}
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