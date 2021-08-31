import React from "react";
import { Tab } from "../../models/Tab";
import { PopupItem, PopupScreen } from "../dialogs/popup";

export const SiteIdentityMainScreen = ({ tab }: { tab: Tab }) => {
    const manager = tab.identityManager;

    let connectionMsg = "";
    let connectionIcon = "";

    switch (manager.identity.connection) {
        case 0:
        case 7:
            connectionMsg = `Your connection to ${manager.identityHost} is not secure. Entering personal information like logins, passwords and banking information may leave it open to attackers.`
            connectionIcon = "http"
            break;
        case 1:
            connectionMsg = `This is a secure Dot Browser page.`
            connectionIcon = "info"
            break;
        case 2:
            connectionMsg = `This is a secure extension page.`
            connectionIcon = "extension"
            break;
        case 3:
            connectionMsg = `This page is stored on your computer.`
            connectionIcon = "file"
            break;
        case 4:
        case 5:
        case 6:
            connectionMsg = `Your connection is secure.`
            connectionIcon = "https"
            break;
        case 8:
            connectionMsg = `Secure connection is not available.`
            connectionIcon = "http"
            break;
        default:
            connectionMsg = `Your connection to ${manager.identityHost} is not secure.`
            connectionIcon = "http"
            break;
    }

    return (
        <PopupScreen title={`Site information for ${manager.identityHost}`}>
            <PopupItem icon={`identity/${connectionIcon}`} title={connectionMsg} />
        </PopupScreen>
    )
}