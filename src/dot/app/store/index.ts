import { combineReducers, compose, createStore } from '@reduxjs/toolkit';
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
            
        )
    )

    return store
};

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

exportPublic("store", store);