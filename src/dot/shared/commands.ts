import { dot } from "../api";
import { BrowserOpenTab, openPreferences } from "../utils/browser";

export const commands: any = {
    "Browser:GoBack": () =>
        dot.tabs.selectedTab?.goBack(),
    "Browser:GoForward": () =>
        dot.tabs.selectedTab?.goForward(),
    "Browser:Reload": () =>
        dot.tabs.selectedTab?.reload(),
    "Browser:Stop": () => dot.tabs.selectedTab?.stop(),

    "Browser:Bookmark": () =>
        console.log("todo"),

    "Browser:NewTab": () => BrowserOpenTab(),

    "Browser:OpenPreferences": () => openPreferences(),

    "Browser:LaunchBrowserToolbox": () =>
        dot.dev.launchBrowserToolbox()
};
