import React from "react";
import { dot } from "../../api";
import { store } from "../../app/store";
import { useBrowserSelector } from "../../app/store/hooks";
import { Services } from "../../modules";
import { formatToParts } from "../../shared/url";
import { Identity } from "../Identity";
import { SearchbarButton } from "../SearchbarButton";

/**
 * A string for the url for a search engine. `%s` will be replaced with the search
 * query.
 *
 * TODO: Make this a setting available to the end user
 */
const searchEngine = 'https://duckduckgo.com/?q=%s'

export const Searchbar = () => {
    const [searchBarHovered, setSearchBarHovered] = React.useState(false);
    const [searchBarFocused, setSearchBarFocused] = React.useState(false);
    const [searchBarMockVisible, setSearchBarMockVisible] = React.useState(true);

    const [searchBarValue, setSearchBarValue] = React.useState("");
    const [searchBarUrlParts, setSearchBarUrlParts] = React.useState({
        scheme: null,
        host: null,
        domain: null,
        path: null,
        query: null,
        hash: null,
        internal: true
    });

    const tabs = useBrowserSelector(s => s.tabs);

    const searchBoxRef = React.useRef<any>();
    const urlSchemeRef = React.useRef<any>();

    const onSearchBoxChange = (e: any) => {
        setSearchBarValue(e.target.value);
    }

    store.subscribe(() => {
        const state = store.getState();
        const currentTab = store.getState().tabs.getTabById(state.tabs.selectedId);

        if (!currentTab) return;

        urlSchemeRef.current.style.setProperty(
            "--searchbar-scheme-width",
            `${urlSchemeRef.current.scrollWidth}px`
        );

        if (currentTab.pageState == "search") {
            setSearchBarMockVisible(false);
            return setSearchBarValue("");
        } else {
            return setSearchBarValue(currentTab.url);
        }
    })

    React.useEffect(() => {
        urlSchemeRef.current.style.setProperty(
            "--searchbar-scheme-width",
            `${urlSchemeRef.current.scrollWidth}px`
        );

        const parts = formatToParts(searchBarValue);

        setSearchBarMockVisible(true);

        if (parts) {
            setSearchBarUrlParts(parts as any);
        }
    }, [searchBarValue])

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
                    }}
                    onMouseLeave={() => {
                        setSearchBarHovered(false)
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
                                searchBarMockVisible &&
                                !searchBarUrlParts.internal &&
                                !searchBarHovered
                            }
                            ref={urlSchemeRef}
                        >
                            {searchBarMockVisible ? searchBarUrlParts.scheme : ""}
                        </span>
                        <span className={"host"}>{searchBarMockVisible ? searchBarUrlParts.host : ""}</span>
                        <span className={"domain"}>{searchBarMockVisible ? searchBarUrlParts.domain : ""}</span>
                        <span className={"path"}>{searchBarMockVisible ? searchBarUrlParts.path : ""}</span>
                        <span className={"query"}>{searchBarMockVisible ? searchBarUrlParts.query : ""}</span>
                        <span className={"hash"}>{searchBarMockVisible ? searchBarUrlParts.hash : ""}</span>
                    </div>
                    <input
                        id={"urlbar-input-box"}
                        placeholder={"Search using DuckDuckGo or enter address"}
                        value={searchBarValue}
                        ref={searchBoxRef}
                        onChange={onSearchBoxChange}
                        onFocus={() => {
                            setSearchBarFocused(true);

                            // This used to be in `onMouseUp` but that is just a
                            // bad time. Also firefox appears to only do it on
                            // focus by default so that is the way we are doing it
                            // Delaying this will stop the user from anciently
                            // clearing focus
                            setTimeout(() => {
                                searchBoxRef.current.setSelectionRange(
                                    0,
                                    searchBoxRef.current.value.length,
                                    'backward'
                                )
                            }, 50);
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

                                if (!dot.tabs.selectedTab) {
                                    console.error('Cannot change the url when no tab is selected')
                                    return
                                }

                                // Unfocus the input
                                if (document?.activeElement) {
                                    (document.activeElement as any).blur()
                                }

                                // If the input does not contain a space and contains
                                // a dot, it is a url
                                if (!containsSpace && containsDots) {
                                    let url

                                    if (containsProtocol) {
                                        url = searchBarValue
                                    } else {
                                        url = `https://${searchBarValue}`
                                    }

                                    dot.tabs.selectedTab.goto(Services.io.newURI(url))
                                } else {
                                    dot.tabs.selectedTab.goto(Services.io.newURI(
                                        searchEngine.replace('%s', searchBarValue.replace(/(\s)/g, '+'))
                                    ))
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