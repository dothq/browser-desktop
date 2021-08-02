import { AnyAction, createReducer } from '@reduxjs/toolkit';
import { TSettingsSection } from '../../../resources/settings/types';

interface SettingsState {
    selectedSection: TSettingsSection
}

const initialState: SettingsState = {
    selectedSection: "general"
}

export const settingsReducer = createReducer(
    initialState,
    {
        SETTINGS_CHANGE_SECTION: (store, action: AnyAction) => {
            store.selectedSection = action.payload;
        }
    }
);

