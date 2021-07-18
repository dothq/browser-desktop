import { AnyAction, createReducer } from '@reduxjs/toolkit';
import { Tab } from '../../../models/Tab';
import { closeTabAction, navigateTabAction } from '../actions/tabs';

interface TabsState {
    list: Tab[],

    getTabById(id: number): Tab | undefined;

    selectedId: number
}

const initialState: TabsState = {
    list: [],

    getTabById(id: number) {
        return this.list.find(tab => tab.id == id);
    },

    selectedId: -1
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

        SELECTED_TAB_CLOSE: (store, action: AnyAction) => closeTabAction(store, store.selectedId),
        
        SELECTED_TAB_NAVIGATE: (
            store,
            action: AnyAction
        ) => navigateTabAction(store, {
            ...action.payload,
            id: store.selectedId
        }),
    }
);

