import React from "react";
import { Tab } from "../../models/Tab";
import { PopupItem, PopupScreen } from "../dialogs/popup";

export const SiteIdentityMainScreen = ({ tab }: { tab: Tab }) => {
    const manager = tab.identityManager;

    const data = manager.getIdentityStrings();

    return (
        <PopupScreen title={`Site information for ${manager.identityHost}`}>
            <PopupItem
                icon={`identity/${data.icon}`}
                title={data.msg}
                colour={data.colour}
            />
        </PopupScreen>
    )
}