import { combineReducers, compose, createStore } from "@reduxjs/toolkit";
import settings from "../reducers/settings";
import { sections } from "../sections/sections";

const configureStore = () => {
    let sectionReducers: any = {};

    for (const [key, value] of Object.entries(sections)) {
        sectionReducers[key] = value.reducer;
    }

    const root = combineReducers({
        settings,
        ...sectionReducers
    })

    return createStore(
        root,
        {},
        compose(

        )
    )
}

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch