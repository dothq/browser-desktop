import { dot } from ".";
import { store } from "../app/store";
import { Theme } from "../models/Theme";
import { TSettingsSection } from "../resources/settings/types";

export class SettingsAPI {
    public getThemes() {
        // dot.theme.themes is a Map, so we can convert it to an array by doing this:
        const themes = Array.from(dot.theme.themes as any).map((x: any) => x[1]) as any;

        const extThemes = themes.filter((x: Theme) => x.type == "extension");
        const customThemes = themes
            .filter((x: Theme) => x.type == "custom")
            .sort((a: any, b: any) => {
                return a.creationTime
                    ? b.creationTime - a.creationTime // sort by date created
                    : (a.name < b.name ? -1 : 1) // sort by name if there is no creation time
            });

        return [...extThemes, ...customThemes] as any;
    }

    public get currentThemeId() {
        return dot.theme.currentThemeId;
    }

    public async createNewTheme() {
        const themes = this.getThemes()
            .filter((x: any) => x.type == "custom");

        const manifest = await dot.extensions.loadManifest("light@themes.dothq.co");
        const theme = manifest.theme?.colors;

        const id = await dot.theme.createTheme(
            `Untitled Theme ${themes.length + 1}`,
            { ...theme }
        );

        return id;
    }

    public get selectedSection() {
        return store.getState().settings.selectedSection
    }

    public set selectedSection(section: TSettingsSection) {
        store.dispatch({
            type: "SETTINGS_CHANGE_SECTION",
            payload: section
        });
    }

    constructor() {

    }
}