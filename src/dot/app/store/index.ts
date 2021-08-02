import { combineReducers, compose, createStore } from '@reduxjs/toolkit';
import { exportPublic } from '../../shared/globals';
import { settingsReducer } from './reducers/settings';
import { tabsReducer } from './reducers/tabs';
import { uiReducer } from './reducers/ui';

const configureStore = (preloadedState?: any) => {
    const root = combineReducers({
        ui: uiReducer,
        tabs: tabsReducer,
        settings: settingsReducer
    })

    const store = createStore(
        root,
        {},
        compose(

        )
    )

    return store
};

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

exportPublic("store", store);