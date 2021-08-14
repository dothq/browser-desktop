import { AnyAction, createReducer } from '@reduxjs/toolkit';

interface TabsState {
    menuitems: {
        id: string,
        menu: any[],
        iconPrefix?: string
    } | null
}

const initialState: TabsState = {
    menuitems: null
}

export const uiReducer = createReducer(
    initialState,
    {
        UI_SET_MENU: (store, action: AnyAction) => {
            store.menuitems = action.payload;
            console.log(action.payload);
        }
    }
);

