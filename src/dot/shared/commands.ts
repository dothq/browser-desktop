import { dot } from "../api";
import { store } from "../app/store";
import { WELCOME_SCREEN_URL } from "./tab";

export const commands: any = {
   "Browser:GoBack": () => dot.tabs.selectedTab?.goBack(),
   "Browser:GoForward": () => dot.tabs.selectedTab?.goForward(),
   "Browser:Reload": () => dot.tabs.selectedTab?.reload(),

   "Browser:Bookmark": () => store.dispatch({
      type: "TAB_BOOKMARK", payload: {
         id: dot.tabs.selectedTabId
      }
   }),

   "Browser:NewTab": () => store.dispatch({
      type: "TAB_CREATE", payload: {
         url: WELCOME_SCREEN_URL
      }
   }),

   "Browser:OpenPreferences": () => store.dispatch({
      type: "TAB_CREATE_INTERNAL", payload: {
         id: "settings"
      }
   }),

   "Browser:LaunchBrowserToolbox": () => dot.dev.launchBrowserToolbox()
}