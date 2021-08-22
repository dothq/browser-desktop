import { dot } from ".";
import { store } from "../app/store";
import { ITab, Tab } from "../models/Tab";
import { Services } from "../modules";
import { NEW_TAB_URL_PARSED } from "../shared/tab";
export class TabsAPI {
    public get list() {
        return store.getState().tabs.list;
    }

    public get selectedTabId() {
        const { tabs } = store.getState();

        return tabs.selectedId;
    }

    public get tabContainer() {
        return document.getElementById("tabbrowser-tabs");
    }

    public tabFilters = new Map();
    public tabListeners = new Map();

    public get selectedTab() {
        return this.get(store.getState().tabs.selectedId)
    }

    public create(data: ITab) {
        const tab = new Tab(data);

        if (tab) {
            this.list.push(tab);

            return tab;
        }
    }

    public get(id: number) {
        const { tabs } = store.getState();

        return tabs.getTabById(id);
    }

    public maybeHideTabs(firstInteraction?: boolean) {
        const state = store.getState();

        const firstTab = state.tabs.list[0];
        if (!firstTab) return;

        const tabUri = Services.io.newURI(firstTab.url);

        if (
            firstTab.state == "loading" &&
            tabUri.spec == "about:blank"
        ) {
            return;
        } else if (
            (firstInteraction ? firstTab.state == "idle" : true) &&
            tabUri.spec !== "about:blank"
        ) {
            // everything should have loaded by now

            if (
                state.tabs.list.length <= 1 && // at least 1 tab open
                tabUri.equals(NEW_TAB_URL_PARSED) && // that tab is the ntp
                dot.prefs.get("dot.tabs.autohide.enabled", true) // we have autohide enabled
            ) {
                dot.window.removeWindowClass("tabs-visible"); // hide tabs
            } else {
                dot.window.addWindowClass("tabs-visible"); // show tabs
            }
        } else {
            // still not ready
            return;
        }
    }

    public getBrowserContainer(browserEl: any) {
        /*
            .browserContainer - up another (second parentElement)
                .browserStack - up one (first parentElement)
                    <browser> - we are here
        */
        const supposedContainer = browserEl.parentElement.parentElement;

        if (supposedContainer.classList.contains("browserContainer")) {
            return supposedContainer;
        } else {
            return null;
        }
    }

    public getPanel(browserEl: any) {
        const supposedContainer = this.getBrowserContainer(browserEl);

        if (supposedContainer) {
            const panel = supposedContainer.parentElement;

            if (panel.classList.contains("browserSidebarContainer")) {
                return panel;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}