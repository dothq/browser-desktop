import React from "react";
import { useBrowserSelector } from "../../app/store/hooks";
import { Identity } from "../Identity";
import { SearchbarButton } from "../SearchbarButton";

export const Searchbar = () => {
    const tabs = useBrowserSelector(s => s.tabs);

    const searchBoxRef = React.useRef<any>();

    const onSearchBoxChange = (e: any) => {
        searchBoxRef.current.value = e.target.value;
    }

    return (
        <div id={"urlbar"}>
            <div id={"urlbar-background"}></div>

            <div id={"urlbar-input-container"}>
                <div id={"identity-box"}>
                    <Identity type={
                        tabs.getTabById(tabs.selectedId)?.pageState || "search"
                    } />
                </div>

                <div id={"urlbar-input"}>
                    <div id={"urlbar-input-url"}>
                        <span
                            className={"scheme"}
                            data-hide-protocol={!tabs.getTabById(tabs.selectedId)?.urlParts.internal}
                        >
                            {tabs.getTabById(tabs.selectedId)?.urlParts.scheme}
                        </span>
                        <span className={"host"}>{tabs.getTabById(tabs.selectedId)?.urlParts.host}</span>
                        <span className={"domain"}>{tabs.getTabById(tabs.selectedId)?.urlParts.domain}</span>
                        <span className={"path"}>{tabs.getTabById(tabs.selectedId)?.urlParts.path}</span>
                    </div>
                    <input
                        id={"urlbar-input-box"}
                        placeholder={"Search using DuckDuckGo or enter address"}
                        value={tabs.getTabById(tabs.selectedId)?.url || ""}
                        ref={searchBoxRef}
                        onChange={onSearchBoxChange}
                        style={{ display: "none" }}
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