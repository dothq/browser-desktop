import React from "react"
import { store } from "../../../../app/store"
import { useBrowserSelector } from "../../../../app/store/hooks"
import * as WebUI from "../../../shared/components/Sidebar"
import { SidebarCategory } from "../../../shared/components/SidebarCategory"
import { TSettingsSection } from "../../types"

export const Sidebar = () => {
    const settings = useBrowserSelector(s => s.settings);

    const onCategoryClick = (id: TSettingsSection) => {
        store.dispatch({
            type: "SETTINGS_CHANGE_SECTION",
            payload: id
        })
    }

    return (
        <WebUI.Sidebar title={"Settings"}>
            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/home-filled.svg"}
                label={"General"}
                selected={settings.selectedSection == "general"}
                onClick={() => onCategoryClick("general")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/customise.svg"}
                label={"Appearance"}
                selected={settings.selectedSection == "appearance"}
                onClick={() => onCategoryClick("appearance")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/navigate.svg"}
                label={"Start Page"}
                selected={settings.selectedSection == "start-page"}
                onClick={() => onCategoryClick("start-page")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/menu.svg"}
                label={"Context Menus"}
                selected={settings.selectedSection == "context-menus"}
                onClick={() => onCategoryClick("context-menus")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/search.svg"}
                label={"Search"}
                selected={settings.selectedSection == "search"}
                onClick={() => onCategoryClick("search")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/identity/https.svg"}
                label={"Privacy and Security"}
                selected={settings.selectedSection == "privacy"}
                onClick={() => onCategoryClick("privacy")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/gesture.svg"}
                label={"Gestures"}
                selected={settings.selectedSection == "gestures"}
                onClick={() => onCategoryClick("gestures")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/download.svg"}
                label={"Downloads"}
                selected={settings.selectedSection == "downloads"}
                onClick={() => onCategoryClick("downloads")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/sync.svg"}
                label={"Sync"}
                selected={settings.selectedSection == "sync"}
                onClick={() => onCategoryClick("sync")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/language.svg"}
                label={"Language and Region"}
                selected={settings.selectedSection == "language"}
                onClick={() => onCategoryClick("language")}
            />

            <SidebarCategory
                icon={"chrome://dot/content/skin/icons/lab.svg"}
                label={"Experiments"}
                selected={settings.selectedSection == "experiments"}
                onClick={() => onCategoryClick("experiments")}
            />
        </WebUI.Sidebar>
    )
}