import { AnyAction, createReducer } from '@reduxjs/toolkit';
import { InternalTab } from '../../../models/InternalTab';
import { Tab } from '../../../models/Tab';
import { bookmarkTabAction, closeTabAction, navigateTabAction, updateFaviconTabAction, updateNavigationStateAction, updateStateTabAction, updateTitleTabAction, updateUrlTabAction } from '../actions/tabs';

interface TabsState {
    list: Tab[],

    selectedTab: Tab | undefined

    getTabById(id: number): Tab | undefined;
    getTabIndexById(id: number): number;

    update(id: number, data: { [key: string]: any }): void;

    selectedId: number

    generation: number

    canGoBack: boolean,
    canGoForward: boolean
}

const initialState: TabsState = {
    list: [],

    selectedTab: undefined,

    getTabById(id: number) {
        return this.list.find(tab => tab.id == id);
    },

    getTabIndexById(id: number) {
        return this.list.findIndex(tab => tab.id == id);
    },

    update(id: number, data: { [key: string]: any }) {
        if (data.noInvalidate) return this.generation = Number(!this.generation);;

        delete data.noInvalidate;

        const tab: any = this.getTabById(id);

        for (const [key, value] of Object.entries(data)) {
            // no point rerendering same data
            if (tab[key] == value) return;

            try {
                tab[key] = value;
            } catch (e) {

            }
        }

        this.generation = Number(!this.generation);
    },

    selectedId: -1,
    generation: 0,

    canGoBack: false,
    canGoForward: false
}

export const tabsReducer = createReducer(
    initialState,
    {
        TAB_CREATE: (store, action: AnyAction) => {
            if (action.payload.internal) {
                return console.warn("Use TAB_CREATE_INTERNAL instead of TAB_CREATE for internal pages.")
            }

            const tab = new Tab(action.payload);

            if (tab) {
                store.list.push(tab);

                if (!action.payload.background) {
                    store.selectedId = tab.id;
                }
            }
        },

        TAB_CREATE_INTERNAL: (store, action: AnyAction) => {
            const tab = new InternalTab(action.payload);

            if (tab) {
                store.list.push(tab);
            }
        },


        TAB_CLOSE: (store, action: AnyAction) => closeTabAction(store, action.payload),

        TAB_SELECT: (store, action: AnyAction) => {
            const tab = store.getTabById(action.payload);

            if (tab) {
                tab.select();
                store.selectedId = action.payload;
                store.selectedTab = tab;
            }
        },

        TAB_NAVIGATE: (store, action: AnyAction) => navigateTabAction(store, action.payload),

        TAB_BOOKMARK: (store, action: AnyAction) => bookmarkTabAction(store, action.payload),

        TAB_UPDATE: (store, action: AnyAction) => {
            const { id } = action.payload;

            delete action.payload.id;
            store.update(id, action.payload);
        },

        TAB_UPDATE_TITLE: (store, action: AnyAction) => updateTitleTabAction(store, action.payload),

        TAB_UPDATE_URL: (store, action: AnyAction) => updateUrlTabAction(store, action.payload),

        TAB_UPDATE_STATE: (store, action: AnyAction) => updateStateTabAction(store, action.payload),

        TAB_UPDATE_FAVICON: (store, action: AnyAction) => updateFaviconTabAction(store, action.payload),

        TAB_UPDATE_NAVIGATION_STATE: (store, action: AnyAction) => updateNavigationStateAction(store, action.payload),

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

