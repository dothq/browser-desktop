import { dot } from ".";
import { store } from "../app/store";
import { ITab, Tab } from "../models/Tab";
import { Services } from "../modules";
import { WELCOME_SCREEN_URL_PARSED } from "../shared/tab";
export class TabsAPI {
    public list: Tab[] = [];

    public get selectedTabId() {
        return dot.browsersPrivate.selectedId;
    }

    public tabFilters = new Map();
    public tabListeners = new Map();

    public get selectedTab() {
        return this.get(this.selectedTabId);
    }

    public create(data: ITab) {
        const tab = new Tab(data);

        if (tab) {
            this.list.push(tab);

            return tab;
        }
    }

    public get(id: number) {
        return this.list.find(tab => tab.id == id);
    }

    public maybeHideTabs() {
        const state = store.getState();

        const firstTab = state.tabs.list[0];
        if (!firstTab) return;

        const tabUri = Services.io.newURI(firstTab.url);

        if (
            state.tabs.list.length <= 1 && // at least 1 tab open
            tabUri.equals(WELCOME_SCREEN_URL_PARSED) && // that tab is the ntp
            dot.prefs.get("dot.tabs.autohide.enabled", true) // we have autohide enabled
        ) {
            dot.window.removeWindowClass("tabs-visible"); // hide tabs
        } else {
            dot.window.addWindowClass("tabs-visible"); // show tabs
        }
    }
}