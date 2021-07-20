import { AnyAction, createReducer } from '@reduxjs/toolkit';
import { Tab } from '../../../models/Tab';
import { closeTabAction, navigateTabAction, updateFaviconTabAction, updateStateTabAction, updateTitleTabAction } from '../actions/tabs';

interface TabsState {
    list: Tab[],

    get selectedTab(): Tab | undefined;

    getTabById(id: number): Tab | undefined;
    getTabIndexById(id: number): number;

    update(id: number, data: { [key: string]: any }): void;

    selectedId: number

    generation: number
}

const initialState: TabsState = {
    list: [],

    get selectedTab() {
        return this.getTabById(this.selectedId)
    },

    getTabById(id: number) {
        return this.list.find(tab => tab.id == id);
    },

    getTabIndexById(id: number) {
        return this.list.findIndex(tab => tab.id == id);
    },

    update(id: number, data: { [key: string]: any }) {
        const tab: any = this.getTabById(id);

        for (const [key, value] of Object.entries(data)) {
            tab[key] = value;
        }

        this.generation = Number(!this.generation);
    },

    selectedId: -1,
    generation: 0
}

export const tabsReducer = createReducer(
    initialState,
    {
        TAB_CREATE: (store, action: AnyAction) => {
            console.log("AC", action.payload);
            const tab = new Tab(action.payload);

            if (tab) store.list.push(tab);
        },

        TAB_CLOSE: (store, action: AnyAction) => closeTabAction(store, action.payload),

        TAB_SELECT: (store, action: AnyAction) => {
            const tab = store.getTabById(action.payload);

            if (tab) {
                tab.select();
                store.selectedId = action.payload;
            }
        },

        TAB_NAVIGATE: (store, action: AnyAction) => navigateTabAction(store, action.payload),

        TAB_UPDATE_TITLE: (store, action: AnyAction) => updateTitleTabAction(store, action.payload),

        TAB_UPDATE_STATE: (store, action: AnyAction) => updateStateTabAction(store, action.payload),

        TAB_UPDATE_FAVICON: (store, action: AnyAction) => updateFaviconTabAction(store, action.payload),

        SELECTED_TAB_CLOSE: (store, action: AnyAction) => closeTabAction(store, store.selectedId),
        
        SELECTED_TAB_NAVIGATE: (
            store,
            action: AnyAction
        ) => navigateTabAction(store, {
            ...action.payload,
            id: store.selectedId
        }),

        SELECTED_TAB_UPDATE_TITLE: (
            store,
            action: AnyAction
        ) => updateTitleTabAction(store, {
            ...action.payload,
            id: store.selectedId
        }),
    }
);

