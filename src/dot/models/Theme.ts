import { dot } from "../api";
import { ThemeVariableMap } from "../shared/theme";
import { ExtensionTheme } from "../types/theme";

interface ThemeProps {
    id: string,
    type: 'extension' | 'custom',
    name: string,
    iconURL?: string,
    theme: ExtensionTheme,
    darkTheme?: ExtensionTheme | null,
    experiments?: any,
    creation_time?: string
}

export class Theme {
    public id: string;
    public type: 'extension' | 'custom';
    public name: string;
    public iconURL: string;
    public creationTime?: string;

    public get active() {
        return dot.theme.currentThemeId == this.id;
    }

    public theme: ExtensionTheme;
    public darkTheme: ExtensionTheme | null;

    public get isDynamic() {
        return this.theme && this.darkTheme;
    }

    public set() {
        dot.window.removeWindowClassByNamespace("theme-");

        const themeData = dot.theme.isSystemDarkMode && this.darkTheme
            ? this.darkTheme
            : this.theme;

        for (let [key, value] of Object.entries(themeData)) {
            if (
                key == "experimental" ||
                key == "id" ||
                key == "version"
            ) continue;

            const index = ThemeVariableMap.findIndex(({ data }: { data: any }) =>
                data.lwtProperty == key
            );

            if (ThemeVariableMap[index]) {
                const { variable } = ThemeVariableMap[index];

                document.documentElement.style.setProperty(
                    variable.replace(/_/g, "-"),
                    value.toString()
                )
            } else {
                console.info(`ThemeAPI: Ignoring colour property "${key}" in theme with ID ${this.id}.`)
            }
        }
    }

    constructor({ id, type, name, iconURL, theme, darkTheme, experiments, creation_time }: ThemeProps) {
        if (!id) throw new Error(`Badly formatted theme: 'id' was not found.`);
        if (!type) throw new Error(`Badly formatted theme: 'type' was not found and was not of type 'extension' or 'custom'.`);
        if (!theme) throw new Error(`Badly formatted theme: 'theme' was not found.`);

        this.id = id;
        this.type = type;
        this.name = name;
        this.iconURL = iconURL || "";

        this.theme = theme;
        this.darkTheme = darkTheme || null;

        this.creationTime = creation_time;
    }
}