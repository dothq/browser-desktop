import React from "react";
import { useBrowserSelector } from "../../app/store/hooks";
import { Identity } from "../Identity";

export const Searchbar = () => {
    const tab = useBrowserSelector((s: any) => s.tabs.selectedTab);

    if(tab) return (
        <div id={"urlbar"}>
            <div id={"urlbar-background"}></div>

            <div id={"urlbar-input-container"}>
                <Identity type={tab.pageState} />

                <label>{tab.url}</label>
            </div>
        </div>
    )

    return <></>
}