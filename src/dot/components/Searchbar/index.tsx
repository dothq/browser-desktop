import React from "react";
import { Identity } from "../Identity";

export const Searchbar = () => {
    const [searchBarHovered, setSearchBarHovered] = React.useState(false);
    const [searchBarFocused, setSearchBarFocused] = React.useState(false);
    const [searchBarMockVisible, setSearchBarMockVisible] = React.useState(true);

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
                        "search"
                    } />
                </div>

                <div
                    id={"urlbar-input"}
                    onMouseOver={() => setSearchBarHovered(true)}
                    onMouseLeave={() => setSearchBarHovered(false)}
                >
                    <div
                        id={"urlbar-input-url"}
                        style={{
                            opacity: searchBarFocused
                                ? 0
                                : 1
                        }}
                    >
                        <span
                            className={"scheme"}
                            data-hide-protocol={
                                searchBarMockVisible &&
                                !searchBarHovered
                            }
                        >
                            { }
                        </span>
                        <span className={"host"}></span>
                        <span className={"domain"}></span>
                        <span className={"path"}></span>
                        <span className={"query"}></span>
                        <span className={"hash"}></span>
                    </div>
                    <input
                        id={"urlbar-input-box"}
                        placeholder={"Search using DuckDuckGo or enter address"}
                        style={{
                            opacity: searchBarFocused
                                ? 1
                                : 0
                        }}
                    ></input>
                </div>

                {/* <div id={"page-action-buttons"}>
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
                </div> */}
            </div>

            {/* <div
                id="urlbar-popout"
                data-open={urlbarPopupVisible && !!searchBarValue.length}
                style={({
                    "--urlbar-popup-height": `${urlbarPopupHeight + 8}px`
                } as any)}
            >
                <div className={"urlbar-popout-container"} ref={urlbarPopupContainerRef}>
                    {suggestions?.map(suggestion => (
                        <SearchbarResult
                            {...suggestion}
                            key={suggestion.id}
                            active={false}
                        />
                    ))}
                </div>
            </div> */}
        </div>
    )
}