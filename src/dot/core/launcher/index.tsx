import React from "react";
import { store } from "../../app/store";
import { useBrowserSelector } from "../../app/store/hooks";
import { Group } from "./components/Group";

export const Launcher = () => {
    const ui = useBrowserSelector(state => state.ui);

    const ref = React.createRef<HTMLInputElement>();
    const scrollableRef = React.createRef<HTMLDivElement>();

    const [expanded, setExpanded] = React.useState(false);

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
        <div
            className={"launcher-wrapper"}
            data-visible={ui.launcherVisible}
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
                    <Group id={"recent"} heading={"Recent"}>
                        big chungus
                    </Group>

                    <Group id={"history"} heading={"History"}>
                        big chungus
                    </Group>

                    <Group id={"bookmarks"} heading={"Bookmarks"}>
                        big chungus
                    </Group>

                    <Group id={"actions"} heading={"Actions"}>
                        big chungus
                    </Group>

                    <Group id={"links"} heading={"Links"}>
                        big chungus
                    </Group>
                </div>
            </div>
        </div>
    )
}