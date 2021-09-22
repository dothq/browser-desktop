/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { dot } from "../api";
import { Theme } from "../models/Theme";
import { AddonManager, ChromeUtils, Services } from "../modules";
import { EMOJI_REGEX } from "../shared/regex";
import { ThemeVariableMap, toRGB, _isColorDark } from "../shared/theme";
import { ExtensionTheme } from "../types/theme";

const { OS } = ChromeUtils.import("resource://gre/modules/osfile.jsm");
const { FileUtils } = ChromeUtils.import(
  "resource://gre/modules/FileUtils.jsm"
)

export class ThemeAPI {
  public themes: Map<string, Theme> = new Map();

  public isSystemDarkMode = false;

  public get isThemeDynamic() {
    return this.current?.isDynamic
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

  public get accentColour() {
    return dot.prefs.get("dot.ui.accent_colour", "blue");
  }

  private _darkModeMediaQuery: MediaQueryList;

  public updateAccentColour(value?: string) {
    if (!value) value = dot.prefs.get("dot.ui.accent_colour") as string;

    const cleansedValue = value.replace(/ /g, "").toLowerCase();

    dot.window.removeWindowClassByNamespace("accent-colour-", document.documentElement)
    dot.window.addWindowClass(
      `accent-colour-${cleansedValue}`,
      true,
      document.documentElement
    )
  }

  public async load(id?: string) {
    // Wait for the AddonManager to load
    await this.awaitAddonManagerStartup();

    // Wait for the browser to load in all the themes
    await this.loadThemes();

    if (!id) {
      id = dot.prefs.get("dot.ui.theme", Services.builtInThemes.DEFAULT_THEME_ID) as string;
    }

    const theme = this.themes.get(id);

    if (theme) {
      this.resetThemeVariables();

      const variableMapped = theme.set();

      dot.prefs.set("dot.ui.theme", theme.id);
      this.currentThemeId = theme.id;

      this.updateAccentColour();
      this.determineDarkness();

      const windowId = document?.defaultView?.docShell.outerWindowID;

      if (windowId) Services.ppmm.sharedData.set(
        `dot-theme-${windowId}`,
        variableMapped
      );
    } else {
      console.error(`ThemesAPI: Unable to locate theme with ID ${id}`);
      this.load(Services.builtInThemes.DEFAULT_THEME_ID);
    }
  }

  public makeThemeVariables(id: string) {
    const theme = this.themes.get(id);
    if (!theme) throw new Error(`Theme with ID ${id} does not exist.`);

    let returnValue: Record<string, string> = {};

    const themeData = dot.theme.isSystemDarkMode && theme.darkTheme
      ? theme.darkTheme
      : theme.theme;

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

        returnValue[variable.replace(/_/g, "-")] = value.toString();
      } else {
        console.info(`ThemeAPI: Ignoring colour property "${key}" in theme with ID ${id}.`)
      }
    }

    return returnValue;
  }

  public async loadThemes() {
    // the themes directory won't exist on first startup
    await OS.File.makeDir(this.customThemesPath.path, { ignoreExisting: true });

    return new Promise(async resolve => {
      const addons = await AddonManager.getAddonsByTypes(["theme"]);

      for await (const addon of addons) {
        const manifest: any = await dot.extensions.loadManifest(addon.id);

        const migratedTheme = this.migrateOldThemeKeysIfNeeded(manifest.theme.colors);
        const migratedDarkTheme = manifest.dark_theme
          ? this.migrateOldThemeKeysIfNeeded(manifest.dark_theme.colors)
          : null;

        const theme = new Theme({
          id: addon.id,

          name: addon.name,
          iconURL: addon.iconURL,
          type: "extension",

          theme: migratedTheme,
          darkTheme: migratedDarkTheme,

          experiments: manifest.theme_experiment ? manifest.theme_experiment : null,
        });

        if (theme) {
          if (!this.themes.has(addon.id)) {
            this.themes.set(addon.id, theme);
          }
        }
      }

      const customThemes = this.customThemesPath.directoryEntries;

      for await (const customTheme of customThemes) {
        const data = await OS.File.read(customTheme.path, { encoding: "utf-8" });
        const json = JSON.parse(data);

        const theme = new Theme({
          ...json,
          theme: this.migrateOldThemeKeysIfNeeded(json.theme),
          darkTheme: json.darkTheme
            ? this.migrateOldThemeKeysIfNeeded(json.Darktheme)
            : null
        });

        if (theme) {
          if (!this.themes.has(json.id)) {
            this.themes.set(json.id, theme);
          }
        }
      }

      resolve(true);
    })
  }

  public async awaitAddonManagerStartup() {
    if (AddonManager.isReady) {
      // Already started up, nothing to do
      return true;
    }

    // Wait until AddonManager is ready to accept calls
    return new Promise(resolve => {
      AddonManager.addManagerListener({
        onStartup() {
          resolve(true);
        },
      });
    });
  }

  public determineDarkness() {
    dot.window.removeWindowClassByNamespace(`theme-is-`, document.documentElement);

    if (this.isThemeDynamic) {
      return dot.window.addWindowClass(
        `theme-is-dynamic`,
        true,
        document.documentElement
      );
    };

    const points = [
      this.currentTheme.toolbar,
      this.currentTheme.frame
    ];

    for (const point of points) {
      const rgb = toRGB(point);

      if (_isColorDark(rgb[0], rgb[1], rgb[2])) {
        dot.window.addWindowClass(
          `theme-is-dark`,
          true,
          document.documentElement
        );
      } else {
        dot.window.addWindowClass(
          `theme-is-light`,
          true,
          document.documentElement
        );
      }
    }
  }

  public migrateOldThemeKeysIfNeeded(oldData: any): ExtensionTheme {
    const freshTheme: ExtensionTheme = {};

    for (const [key, value] of Object.entries(oldData)) {
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
      document.documentElement.style.removeProperty(variable);
    })
  }

  public async createTheme(name: string, data: object) {
    const id = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(EMOJI_REGEX, "")
      .split(" ")
      .filter(a => a.length)
      .join("-") + `-${dot.utilities.makeID(2)}`;

    await OS.File.makeDir(this.customThemesPath.path, { ignoreExisting: true });

    const themePath = FileUtils.getFile("ProfLD", [
      "themes",
      `${id}.json`
    ]).path;

    const theme = this.migrateOldThemeKeysIfNeeded(data);

    this.load(id);

    OS.File.writeAtomic(themePath, JSON.stringify({
      id,
      name,
      type: "custom",
      creation_time: (new Date()).toISOString(),
      theme
    }, null, 2), {
      encoding: "utf-8",
    });

    return id;
  }

  public customThemesPath = FileUtils.getDir("ProfLD", ["themes"]);

  constructor() {
    this._darkModeMediaQuery = window.matchMedia("(-moz-system-dark-theme)");
    this.isSystemDarkMode = this._darkModeMediaQuery.matches;
    this._darkModeMediaQuery.addEventListener("change", ({ matches }) => {
      this.isSystemDarkMode = matches;
      this.load();
    });

    /* Listen for theme changes and reinit */
    Services.obs.addObserver(
      () => this.load(),
      "lightweight-theme-styling-update"
    );
  }
}