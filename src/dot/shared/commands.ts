import { dot } from "../api";
import { store } from "../app/store";
import { NEW_TAB_URL } from "./tab";

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
         url: NEW_TAB_URL
      }
   }),

   "Browser:OpenPreferences": () => store.dispatch({
      type: "TAB_CREATE", payload: {
         url: `about:settings`
      }
   }),

   "Browser:LaunchBrowserToolbox": () => dot.dev.launchBrowserToolbox()
}