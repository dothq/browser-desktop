import { action, observable } from "mobx";
import { ITab, Tab } from "../models/Tab";
export class TabsAPI {
    @observable public list: Tab[] = [];

    @observable public selectedTabId: number = -1;

    @observable public tabFilters = new Map();
    @observable public tabListeners = new Map();

    public get selectedTab() {
        return this.get(this.selectedTabId);
    }

    @action public create(data: ITab) {
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