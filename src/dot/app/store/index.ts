import { combineReducers, compose, createStore } from '@reduxjs/toolkit';
import devToolsEnhancer from 'remote-redux-devtools';
import { exportPublic } from '../../shared/globals';
import { counterReducer } from './reducers/counter';
import { tabsReducer } from './reducers/tabs';

const configureStore = (preloadedState?: any) => {
    const root = combineReducers({
        counter: counterReducer,

        tabs: tabsReducer
    })

    const store = createStore(
        root,
        {},
        compose(
            devToolsEnhancer({ hostname: "127.0.0.1", port: 3855, realtime: true })
        )
    )

    return store
};

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

exportPublic("store", store);