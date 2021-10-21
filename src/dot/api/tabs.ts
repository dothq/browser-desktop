import { action, computed, makeObservable, observable } from "mobx";
import { Tab } from "../models/Tab";
import { Ci } from "../modules";
import { TabProgressListener } from "../services/progress";

export class TabsAPI {
    @observable
    public list: Tab[] = [];
    
    @observable
    public selectedTabId = -1;

    public get tabContainer() {
        return document.getElementById("tabbrowser-tabs");
    }

    public tabFilters = new Map();
    public tabListeners = new Map();

    @computed
    public get selectedTab() {
        return this.get(this.selectedTabId);
    }

    @action
    public create(data: Partial<Tab>) {
        const tab = new Tab(data);

        if (tab) {
            this.list.push(tab);

            if (!data.background) {
                this.selectedTabId = tab.id;
            }
        }
    }

    public get(id: number) {
        return this.list.find(x => x.id == id);
    }

    public getTabById = this.get;

    public getBrowserContainer(browserEl: any) {
        /*
            .browserContainer - up another (second parentElement)
                .browserStack - up one (first parentElement)
                    <browser> - we are here
        */
        const supposedContainer =
            browserEl.parentElement.parentElement;

        if (
            supposedContainer.classList.contains(
                "browserContainer"
            )
        ) {
            return supposedContainer;
        } else {
            return null;
        }
    }

    public getPanel(browserEl: any) {
        const supposedContainer =
            this.getBrowserContainer(browserEl);

        if (supposedContainer) {
            const panel = supposedContainer.parentElement;

            if (
                panel.classList.contains(
                    "browserSidebarContainer"
                )
            ) {
                return panel;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public constructor() {
        makeObservable(this);

        addEventListener(
            "WillChangeBrowserRemoteness",
            (event: any) => {
                let { browserId } = event.originalTarget;
                let tab: Tab | undefined =
                    this.get(browserId);
                if (!tab) {
                    return;
                }

                tab.emit("remote-changed");

                // Unhook our progress listener.
                let filter =
                    this.tabFilters.get(browserId);
                let oldListener =
                    this.tabListeners.get(browserId);

                tab.webContents.webProgress.removeProgressListener(
                    filter
                );
                filter.removeProgressListener(
                    oldListener
                );

                // We'll be creating a new listener, so destroy the old one.
                oldListener = null;

                tab.webContents.addEventListener(
                    "DidChangeBrowserRemoteness",
                    (event: any) => {
                        const progressListener =
                            new TabProgressListener(
                                browserId
                            );

                        this.tabListeners.set(
                            browserId,
                            progressListener
                        );
                        filter.addProgressListener(
                            progressListener,
                            Ci.nsIWebProgress.NOTIFY_ALL
                        );

                        tab?.webContents.webProgress.addProgressListener(
                            filter,
                            Ci.nsIWebProgress.NOTIFY_ALL
                        );

                        if (
                            tab?.webContents
                                .isRemoteBrowser
                        ) {
                            // todo: add crashed prop to tab
                        }

                        event =
                            document.createEvent(
                                "Events"
                            );
                        event.initEvent(
                            "TabRemotenessChange",
                            true,
                            false
                        );
                        tab?.webContents.dispatchEvent(
                            event
                        );
                    },
                    { once: true }
                );
            }
        );
    }
}
