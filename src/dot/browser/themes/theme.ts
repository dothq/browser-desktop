import { ExtensionTheme } from "browser/extensions/manifest";
import dot from "index";

interface ThemeProps {
    id: string;
    type: "extension" | "custom";
    name: string;
    iconURL?: string;
    theme: ExtensionTheme;
    darkTheme?: ExtensionTheme | null;
    experiments?: any;
    creation_time?: string;
}

export class Theme {
    public id: string;
    public type: "extension" | "custom";
    public name: string;
    public iconURL: string;
    public creationTime?: string;

    public get active() {
        return dot.themes.currentThemeId == this.id;
    }

    public theme: ExtensionTheme;
    public darkTheme: ExtensionTheme | null;

    public get isDynamic() {
        return this.theme && this.darkTheme;
    }

    public getVariables() {
        const variables = dot.themes.makeThemeVariables(
            this.id
        );

        return variables;
    }

    public constructor({
        id,
        type,
        name,
        iconURL,
        theme,
        darkTheme,
        experiments,
        creation_time
    }: ThemeProps) {
        if (!id)
            throw new Error(
                `Badly formatted theme: 'id' was not found.`
            );
        if (!type)
            throw new Error(
                `Badly formatted theme: 'type' was not found and was not of type 'extension' or 'custom'.`
            );
        if (!theme)
            throw new Error(
                `Badly formatted theme: 'theme' was not found.`
            );

        this.id = id;
        this.type = type;
        this.name = name;
        this.iconURL = iconURL || "";

        this.theme = theme;
        this.darkTheme = darkTheme || null;

        this.creationTime = creation_time;
    }
}