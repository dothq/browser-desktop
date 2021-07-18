import { dot } from ".";
import { ITab, Tab } from "../models/Tab";
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
        
        if(tab) {
            this.list.push(tab);
        
            return tab;
        }
    }

    public get(id: number) {
        return this.list.find(tab => tab.id == id);
    }
}