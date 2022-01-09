/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ExtensionTheme } from "browser/extensions/manifest";
import { Browser } from "index";
import {
    AddonManager,
    FileUtils,
    OS,
    Services
} from "mozilla";
import { EMOJI_REGEX } from "shared/regex";
import { ThemeVariableMap } from "./map";
import { Theme } from "./theme";
import { isColourDark, toRGB } from "./utils";

class BrowserThemes {
    public themes: Map<string, Theme> = new Map();

    public isSystemDarkMode = false;

    public get isThemeDynamic() {
        return this.current?.isDynamic;
    }

    public currentThemeId: string = "";

    public get currentTheme() {
        const { theme, darkTheme }: any = this.current;

        return this.isSystemDarkMode && darkTheme
            ? darkTheme
            : theme;
    }

    public get current() {
        return this.themes.get(this.currentThemeId);
    }

    /*
     * Accent colours defined in a list
     * First item is the light variant
     * Second item is the dark variant
     */
    public accentColours: Record<any, any> = {
        red: ["#F64242", "#FAA0A0"],
        orange: ["#FE9333", "#FEC999"],
        yellow: ["#FDCD3A", "#FEE69D"],
        green: ["#30D02C", "#97E895"],
        blue: ["#256EF5", "#92B6FA"],
        indigo: ["#2C3DD0", "#959DE8"],
        purple: ["#742CD0", "#B995E8"],
        pink: ["#C32CD0", "#E295E8"],
        gray: ["#8D8D8D", "#C6C6C6"]
    };

    public get accentColour() {
        return this.browser.preferences.get(
            "dot.ui.accent_colour",
            "blue"
        );
    }

    private _darkModeMediaQuery: MediaQueryList;

    public updateAccentColour(value?: string) {
        if (!value)
            value = this.browser.preferences.get(
                "dot.ui.accent_colour"
            ) as string;

        if (
            Object.keys(this.accentColours).includes(
                value
            )
        ) {
            const isDarkTheme = this.determineDarkness();

            this.setThemeProperty(
                "--chrome-accent-colour",
                isDarkTheme
                    ? this.accentColours[value][1]
                    : this.accentColours[value][0]
            );
        } else {
            throw new Error(
                `Invalid accent colour '${value}'`
            );
        }
    }

    public updateChromeRoundness(
        value?: any,
        shouldAnimate?: boolean
    ) {
        if (!value)
            value = this.browser.preferences.get(
                "dot.ui.roundness",
                8
            );

        value = parseFloat(value);

        if (isNaN(value)) value = 8;

        if (value >= 24) value = 24;
        if (value <= 0) value = 0;

        this.setThemeProperty(
            "--chrome-roundness",
            `${value}px`
        );
    }

    public setThemeProperty(key: string, value: any) {
        const browser =
            document.getElementById("browser");

        browser?.style.setProperty(key, value);
    }

    /**
     * Set the current theme applied to the browser
     * @param id The ID of the theme you wish to set
     */
    public async load(id?: string) {
        // Wait for the AddonManager to load
        await this.awaitAddonManagerStartup();

        // Wait for the browser to load in all the themes
        await this.loadThemes();

        if (!id) {
            id = this.browser.preferences.get(
                "dot.ui.theme",
                Services.builtInThemes.DEFAULT_THEME_ID
            ) as string;
        }

        const theme = this.themes.get(id);

        if (theme) {
            this.resetThemeVariables();

            const variableMapped = theme.getVariables();

            this.browser.preferences.set(
                "dot.ui.theme",
                theme.id
            );
            this.currentThemeId = theme.id;

            this.updateAccentColour();
            this.updateChromeRoundness();

            for (const [key, value] of Object.entries(
                variableMapped
            )) {
                this.setThemeProperty(key, value);
            }

            const windowId =
                document?.defaultView?.docShell
                    .outerWindowID;

            if (windowId)
                Services.ppmm.sharedData.set(
                    `dot-theme-${windowId}`,
                    variableMapped
                );
        } else {
            console.error(
                `ThemesAPI: Unable to locate theme with ID ${id}`
            );
            this.load(
                Services.builtInThemes.DEFAULT_THEME_ID
            );
        }
    }

    public makeThemeVariables(id: string) {
        const theme = this.themes.get(id);
        if (!theme)
            throw new Error(
                `Theme with ID ${id} does not exist.`
            );

        let returnValue: Record<string, string> = {};

        const themeData =
            this.isSystemDarkMode && theme.darkTheme
                ? theme.darkTheme
                : theme.theme;

        for (let [key, value] of Object.entries(
            themeData
        )) {
            if (
                key == "experimental" ||
                key == "id" ||
                key == "version"
            )
                continue;

            const index = ThemeVariableMap.findIndex(
                ({ data }: { data: any }) =>
                    data.lwtProperty == key
            );

            if (ThemeVariableMap[index]) {
                const { variable } =
                    ThemeVariableMap[index];

                returnValue[variable.replace(/_/g, "-")] =
                    value.toString();
            }
        }

        return returnValue;
    }

    public async loadThemes() {
        // the themes directory won't exist on first startup
        await OS.File.makeDir(
            this.customThemesPath.path,
            { ignoreExisting: true }
        );

        return new Promise(async (resolve) => {
            const addons =
                await AddonManager.getAddonsByTypes([
                    "theme"
                ]);

            for await (const addon of addons) {
                const manifest: any =
                    await this.browser.extensions.loadManifest(
                        addon.id
                    );

                const migratedTheme =
                    this.migrateOldThemeKeysIfNeeded(
                        manifest.theme.colors
                    );
                const migratedDarkTheme =
                    manifest.dark_theme
                        ? this.migrateOldThemeKeysIfNeeded(
                              manifest.dark_theme.colors
                          )
                        : null;

                const theme = new Theme({
                    id: addon.id,

                    name: addon.name,
                    iconURL: addon.iconURL,
                    type: "extension",

                    theme: migratedTheme,
                    darkTheme: migratedDarkTheme,

                    experiments: manifest.theme_experiment
                        ? manifest.theme_experiment
                        : null
                });

                if (theme) {
                    if (!this.themes.has(addon.id)) {
                        this.themes.set(addon.id, theme);
                    }
                }
            }

            const customThemes =
                this.customThemesPath.directoryEntries;

            for await (const customTheme of customThemes) {
                const data = await OS.File.read(
                    customTheme.path,
                    { encoding: "utf-8" }
                );
                const json = JSON.parse(data);

                const theme = new Theme({
                    ...json,
                    theme: this.migrateOldThemeKeysIfNeeded(
                        json.theme
                    ),
                    darkTheme: json.darkTheme
                        ? this.migrateOldThemeKeysIfNeeded(
                              json.Darktheme
                          )
                        : null
                });

                if (theme) {
                    if (!this.themes.has(json.id)) {
                        this.themes.set(json.id, theme);
                    }
                }
            }

            resolve(true);
        });
    }

    public async awaitAddonManagerStartup() {
        if (AddonManager.isReady) {
            // Already started up, nothing to do
            return true;
        }

        // Wait until AddonManager is ready to accept calls
        return new Promise((resolve) => {
            AddonManager.addManagerListener({
                onStartup() {
                    resolve(true);
                }
            });
        });
    }

    public determineDarkness() {
        const points = [
            this.currentTheme.toolbar,
            this.currentTheme.frame
        ];

        let results = [];
        let index = 0;

        for (const point of points) {
            const rgb = toRGB(point);

            if (isColourDark(rgb[0], rgb[1], rgb[2])) {
                results[index] = true;
            } else {
                results[index] = false;
            }

            ++index;
        }

        const passedAmount = results.filter(
            (i) => i == true
        );

        return passedAmount.length >= points.length / 2;
    }

    public migrateOldThemeKeysIfNeeded(
        oldData: any
    ): ExtensionTheme {
        const freshTheme: ExtensionTheme = {};

        for (const [key, value] of Object.entries(
            oldData
        )) {
            switch (key) {
                case "accentcolor":
                    freshTheme.frame = `${value}`;
                    break;
                case "accentcolorInactive":
                    freshTheme.frame_inactive = `${value}`;
                    break;
                case "textcolor":
                    freshTheme.tab_background_text = `${value}`;
                    break;
                case "toolbarColor":
                    freshTheme.toolbar = `${value}`;
                    break;
                case "bookmark_text":
                    freshTheme.toolbar_text = `${value}`;
                    break;
                case "icon_color":
                    freshTheme.icons = `${value}`;
                    break;
                case "icon_attention_color":
                    freshTheme.icons_attention = `${value}`;
                    break;
                default:
                    (freshTheme as any)[key] = `${value}`;
                    break;
            }
        }

        return freshTheme;
    }

    public resetThemeVariables() {
        ThemeVariableMap.forEach(({ variable }) => {
            document.documentElement.style.removeProperty(
                variable
            );
        });
    }

    public async createTheme(name: string, data: object) {
        const id =
            name
                .toLowerCase()
                .replace(/[^a-zA-Z0-9 ]/g, "")
                .replace(EMOJI_REGEX, "")
                .split(" ")
                .filter((a) => a.length)
                .join("-") +
            `-${this.browser.utilities.genId(2)}`;

        await OS.File.makeDir(
            this.customThemesPath.path,
            { ignoreExisting: true }
        );

        const themePath = FileUtils.getFile("ProfLD", [
            "themes",
            `${id}.json`
        ]).path;

        const theme =
            this.migrateOldThemeKeysIfNeeded(data);

        this.load(id);

        OS.File.writeAtomic(
            themePath,
            JSON.stringify(
                {
                    id,
                    name,
                    type: "custom",
                    creation_time:
                        new Date().toISOString(),
                    theme
                },
                null,
                2
            ),
            {
                encoding: "utf-8"
            }
        );

        return id;
    }

    public customThemesPath = FileUtils.getDir("ProfLD", [
        "themes"
    ]);

    public constructor(private browser: Browser) {
        this._darkModeMediaQuery = window.matchMedia(
            "(-moz-system-dark-theme)"
        );

        this.isSystemDarkMode =
            this._darkModeMediaQuery.matches;

        this._darkModeMediaQuery.addEventListener(
            "change",
            ({ matches }) => {
                this.isSystemDarkMode = matches;
                this.load();
            }
        );

        /* Listen for theme changes and reinit */
        Services.obs.addObserver(
            () => this.load(),
            "lightweight-theme-styling-update"
        );
    }
}

export default BrowserThemes;