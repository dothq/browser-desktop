import React from "react";
import { dot } from "../../api";
import { store } from "../../app/store";
import { useBrowserSelector } from "../../app/store/hooks";
import { Services } from "../../modules";
import { Identity } from "../Identity";
import { SearchbarButton } from "../SearchbarButton";

export const Searchbar = () => {
    const [searchBarHovered, setSearchBarHovered] = React.useState(false);
    const [searchBarFocused, setSearchBarFocused] = React.useState(false);
    const [searchBarMockVisible, setSearchBarMockVisible] = React.useState(true);

    const [searchBarValue, setSearchBarValue] = React.useState("");

    const tabs = useBrowserSelector(s => s.tabs);

    const searchBoxRef = React.useRef<any>();

    const onSearchBoxChange = (e: any) => {
        setSearchBarValue(e.target.value);
    }

    store.subscribe(() => {
        const state = store.getState();
        const currentTab = store.getState().tabs.getTabById(state.tabs.selectedId);

        if (!currentTab) return;

        if (currentTab.pageState == "search") {
            setSearchBarMockVisible(false);
            return setSearchBarValue("");
        } else {
            setSearchBarMockVisible(true);
            return setSearchBarValue(currentTab.url);
        }
    })

    return (
        <div id={"urlbar"}>
            <div
                id={"urlbar-background"}
                data-hovered={searchBarHovered}
                data-focused={searchBarFocused}
            ></div>

            <div id={"urlbar-input-container"}>
                <div id={"identity-box"}>
                    <Identity type={
                        tabs.getTabById(tabs.selectedId)?.pageState || "search"
                    } />
                </div>

                <div
                    id={"urlbar-input"}
                    onMouseOver={() => {
                        setSearchBarHovered(true)
                        setSearchBarMockVisible(false)
                    }}
                    onMouseLeave={() => {
                        setSearchBarHovered(false)
                        setSearchBarMockVisible(true)
                    }}
                >
                    <div
                        id={"urlbar-input-url"}
                        style={{
                            opacity: searchBarFocused || (tabs.getTabById(tabs.selectedId)?.pageState || "search") == "search"
                                ? 0
                                : 1
                        }}
                    >
                        <span
                            className={"scheme"}
                            data-hide-protocol={
                                !tabs.getTabById(tabs.selectedId)?.urlParts.internal &&
                                !searchBarHovered
                            }
                        >
                            {tabs.getTabById(tabs.selectedId)?.urlParts.scheme}
                        </span>
                        <span className={"host"}>{tabs.getTabById(tabs.selectedId)?.urlParts.host}</span>
                        <span className={"domain"}>{tabs.getTabById(tabs.selectedId)?.urlParts.domain}</span>
                        <span className={"path"}>{tabs.getTabById(tabs.selectedId)?.urlParts.path}</span>
                        <span className={"query"}>{tabs.getTabById(tabs.selectedId)?.urlParts.query}</span>
                        <span className={"hash"}>{tabs.getTabById(tabs.selectedId)?.urlParts.hash}</span>
                    </div>
                    <input
                        id={"urlbar-input-box"}
                        placeholder={"Search using DuckDuckGo or enter address"}
                        value={searchBarValue}
                        ref={searchBoxRef}
                        onChange={onSearchBoxChange}
                        onFocus={() => {
                            setSearchBarFocused(true);
                        }}
                        onMouseUp={() => {
                            searchBoxRef.current.setSelectionRange(0, searchBoxRef.current.value.length);
                        }}
                        onBlur={() => setSearchBarFocused(false)}
                        style={{
                            opacity: searchBarFocused || (tabs.getTabById(tabs.selectedId)?.pageState || "search") == "search"
                                ? 1
                                : 0
                        }}
                        onKeyDown={event => {
                            if (event.key == "Enter") {
                                // Logic for handling navigation
                                const containsSpace = /\s/.test(searchBarValue);
                                const containsDots = /\./.test(searchBarValue);
                                const containsProtocol = /((https)|(http)|(file)):\/\//.test(searchBarValue);

                                // If the input does not contain a space and contains
                                // a dot, it is a url
                                if (!containsSpace && containsDots) {
                                    if (dot.tabs.selectedTab) {
                                        let url

                                        if (containsProtocol) {
                                            url = searchBarValue
                                        } else {
                                            url = `https://${searchBarValue}`
                                        }

                                        dot.tabs.selectedTab.goto(Services.io.newURI(url))
                                    } else {
                                        console.error('Cannot change the url when no tab is selected')
                                    }
                                } else {
                                    console.log('Submission is a search query')
                                }
                            }
                        }}
                    ></input>
                </div>

                <div id={"page-action-buttons"}>
                    <SearchbarButton
                        id={"star-button-box"}
                        icon={tabs.getTabById(tabs.selectedId)?.bookmarked
                            ? "chrome://dot/content/skin/icons/bookmark-filled.svg"
                            : "chrome://dot/content/skin/icons/actions/new-bookmark.svg"
                        }
                        command={"Browser:Bookmark"}
                        className={tabs.getTabById(tabs.selectedId)?.bookmarked ? "starred" : ""}
                    />

                    <SearchbarButton
                        id={"more-button-box"}
                        icon={"chrome://dot/content/skin/icons/more.svg"}
                    />
                </div>
            </div>
        </div>
    )
}