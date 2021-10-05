import {
    AnyAction,
    createReducer
} from "@reduxjs/toolkit";

interface TabsState {
    launcherVisible: boolean;
    menuitems: {
        id: string;
        menu: any[];
        iconPrefix?: string;
    } | null;
}

const initialState: TabsState = {
    menuitems: null,
    launcherVisible: false
};

export const uiReducer = createReducer(initialState, {
    UI_SET_MENU: (store, action: AnyAction) => {
        store.menuitems = action.payload;
        console.log(action.payload);
    },

    UI_TOGGLE_LAUNCHER: (store, action: AnyAction) => {
        store.launcherVisible = action.payload;
    }
});
