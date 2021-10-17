import {
    AnyAction,
    createReducer
} from "@reduxjs/toolkit";
import { Tab } from "../../../models/Tab";
import {
    bookmarkTabAction,
    closeTabAction,
    navigateTabAction,
    updateFaviconTabAction,
    updateNavigationStateAction,
    updateStateTabAction,
    updateTitleTabAction,
    updateUrlTabAction
} from "../actions/tabs";

interface TabsState {
    list: Tab[];

    selectedTab: Tab | undefined;

    getTabById(id: number): Tab | undefined;
    getTabIndexById(id: number): number;

    update(
        id: number,
        data: { [key: string]: any }
    ): void;

    selectedId: number;

    generation: number;

    canGoBack: boolean;
    canGoForward: boolean;

    /**
     * If an individual tab is the target of a tab drag
     */
    individualTabDragTarget: boolean;
}

const initialState: TabsState = {
    list: [],

    selectedTab: undefined,

    getTabById(id: number | string) {
        return this.list.find((tab: Tab) => tab.id == id);
    },

    getTabIndexById(id: number | string) {
        return this.list.findIndex(
            (tab: Tab) => tab.id == id
        );
    },

    update(id: number, data: { [key: string]: any }) {
        if (data.noInvalidate)
            return (this.generation = Number(
                !this.generation
            ));

        delete data.noInvalidate;

        const tab: any = this.getTabById(id);

        for (const [key, value] of Object.entries(data)) {
            // no point rerendering same data
            if (tab[key] == value) return;

            try {
                tab[key] = value;
            } catch (e) {}
        }

        this.generation = Number(!this.generation);
    },

    selectedId: -1,
    generation: 0,

    canGoBack: false,
    canGoForward: false,

    individualTabDragTarget: false
};

export const tabsReducer = createReducer(initialState, {
    TAB_CREATE: (store, action: AnyAction): any => {
        const tab = new Tab(action.payload);

        if (tab) {
            store.list.push(tab);

            if (!action.payload.background) {
                store.selectedId = tab.id;
            }
        }
    },

    TAB_CLOSE: (store, action: AnyAction) =>
        closeTabAction(store, action.payload),

    TAB_SELECT: (store, action: AnyAction) => {
        const tab = store.getTabById(action.payload);

        if (tab) {
            tab.select();
            store.selectedId = action.payload;
            store.selectedTab = tab;
        }
    },

    TAB_NAVIGATE: (store, action: AnyAction) =>
        navigateTabAction(store, action.payload),

    TAB_BOOKMARK: (store, action: AnyAction) =>
        bookmarkTabAction(store, action.payload),

    TAB_UPDATE: (store, action: AnyAction) => {
        const { id } = action.payload;

        delete action.payload.id;
        store.update(id, action.payload);
    },

    TAB_UPDATE_TITLE: (store, action: AnyAction) =>
        updateTitleTabAction(store, action.payload),

    TAB_UPDATE_URL: (store, action: AnyAction) =>
        updateUrlTabAction(store, action.payload),

    TAB_UPDATE_STATE: (store, action: AnyAction) =>
        updateStateTabAction(store, action.payload),

    TAB_UPDATE_FAVICON: (store, action: AnyAction) =>
        updateFaviconTabAction(store, action.payload),

    TAB_UPDATE_NAVIGATION_STATE: (
        store,
        action: AnyAction
    ) =>
        updateNavigationStateAction(
            store,
            action.payload
        ),

    TAB_KILL: (store, action: AnyAction) => {
        store.list = store.list.filter(
            (t) => t.id !== action.payload
        );
    },

    /**
     * Places a tab in front of another tab. The payload should be `{ oldIndex: number, newIndex: number }`
     * @param store
     * @param action
     */
    RELOCATE_TAB: (store, action: AnyAction) => {
        const dragTab =
            store.list[action.payload.oldIndex];

        let tabs = store.list.filter(
            (t) => t.id !== dragTab.id
        );
        tabs.splice(action.payload.newIndex, 0, dragTab);

        store.list = tabs;
    },

    SELECTED_TAB_CLOSE: (store) =>
        closeTabAction(store, store.selectedId),

    SELECTED_TAB_NAVIGATE: (store, action: AnyAction) =>
        navigateTabAction(store, {
            ...action.payload,
            id: store.selectedId
        }),

    SELECTED_TAB_UPDATE_TITLE: (
        store,
        action: AnyAction
    ) =>
        updateTitleTabAction(store, {
            ...action.payload,
            id: store.selectedId
        }),

    INDIVIDUAL_TAB_DRAG_TARGET: (
        store,
        action: AnyAction
    ) => {
        store.individualTabDragTarget = action.payload;
    }
});
