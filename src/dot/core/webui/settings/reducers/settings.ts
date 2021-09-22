import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { sections } from "../sections/sections";

interface State {
    selectedSectionId: string
}

const initialState: State = {
    selectedSectionId: Object.keys(sections)[0] || ""
}

export const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setActiveSection: (state: State, action: PayloadAction<string>) => {
            if (!sections[action.payload]) {
                state.selectedSectionId = "general";
            }

            state.selectedSectionId = action.payload;
        }
    }
})

export const {
    setActiveSection
} = settingsSlice.actions;

export default settingsSlice.reducer