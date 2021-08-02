/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { dot } from "../api";
import { AddonManager, ChromeUtils, Services } from "../modules";

const { LightweightThemeManager } = ChromeUtils.import(
  "resource://gre/modules/LightweightThemeManager.jsm"
);

const { ThemeVariableMap } = ChromeUtils.defineModuleGetter(
  window,
  "ThemeVariableMap",
  "resource:///modules/ThemeVariableMap.jsm"
);

const toolkitVariableMap = [
  [
    "--lwt-accent-color",
    {
      lwtProperty: "accentcolor",
      processColor(rgbaChannels: any, element: any) {
        if (!rgbaChannels || rgbaChannels.a == 0) {
          return "white";
        }
        // Remove the alpha channel
        const { r, g, b } = rgbaChannels;
        return `rgb(${r}, ${g}, ${b})`;
      },
    },
  ],
  [
    "--lwt-text-color",
    {
      lwtProperty: "textcolor",
      processColor(rgbaChannels: any, element: any) {
        if (!rgbaChannels) {
          rgbaChannels = { r: 0, g: 0, b: 0 };
        }
        // Remove the alpha channel
        const { r, g, b } = rgbaChannels;
        element.setAttribute(
          "lwthemetextcolor",
          _isColorDark(r, g, b) ? "dark" : "bright"
        );
        return `rgba(${r}, ${g}, ${b})`;
      },
    },
  ],
  [
    "--arrowpanel-background",
    {
      lwtProperty: "popup",
    },
  ],
  [
    "--arrowpanel-color",
    {
      lwtProperty: "popup_text",
      processColor(rgbaChannels: any, element: any) {
        const disabledColorVariable = "--panel-disabled-color";
        const descriptionColorVariable = "--panel-description-color";

        if (!rgbaChannels) {
          element.removeAttribute("lwt-popup-brighttext");
          element.style.removeProperty(disabledColorVariable);
          element.style.removeProperty(descriptionColorVariable);
          return null;
        }

        let { r, g, b, a } = rgbaChannels;

        if (_isColorDark(r, g, b)) {
          element.removeAttribute("lwt-popup-brighttext");
        } else {
          element.setAttribute("lwt-popup-brighttext", "true");
        }

        element.style.setProperty(
          disabledColorVariable,
          `rgba(${r}, ${g}, ${b}, 0.5)`
        );
        element.style.setProperty(
          descriptionColorVariable,
          `rgba(${r}, ${g}, ${b}, 0.7)`
        );
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      },
    },
  ],
  [
    "--arrowpanel-border-color",
    {
      lwtProperty: "popup_border",
    },
  ],
  [
    "--lwt-toolbar-field-background-color",
    {
      lwtProperty: "toolbar_field",
    },
  ],
  [
    "--lwt-toolbar-field-color",
    {
      lwtProperty: "toolbar_field_text",
      processColor(rgbaChannels: any, element: any) {
        if (!rgbaChannels) {
          element.removeAttribute("lwt-toolbar-field-brighttext");
          return null;
        }
        const { r, g, b, a } = rgbaChannels;
        if (_isColorDark(r, g, b)) {
          element.removeAttribute("lwt-toolbar-field-brighttext");
        } else {
          element.setAttribute("lwt-toolbar-field-brighttext", "true");
        }
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      },
    },
  ],
  [
    "--lwt-toolbar-field-border-color",
    {
      lwtProperty: "toolbar_field_border",
    },
  ],
  [
    "--lwt-toolbar-field-focus",
    {
      lwtProperty: "toolbar_field_focus",
      fallbackProperty: "toolbar_field",
      processColor(rgbaChannels: any, element: any, propertyOverrides: any) {
        // Ensure minimum opacity as this is used behind address bar results.
        if (!rgbaChannels) {
          propertyOverrides.set("toolbar_field_text_focus", "black");
          return "white";
        }
        const min_opacity = 0.9;
        let { r, g, b, a } = rgbaChannels;
        if (a < min_opacity) {
          propertyOverrides.set(
            "toolbar_field_text_focus",
            _isColorDark(r, g, b) ? "white" : "black"
          );
          return `rgba(${r}, ${g}, ${b}, ${min_opacity})`;
        }
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      },
    },
  ],
  [
    "--lwt-toolbar-field-focus-color",
    {
      lwtProperty: "toolbar_field_text_focus",
      fallbackProperty: "toolbar_field_text",
      processColor(rgbaChannels: any, element: any) {
        if (!rgbaChannels) {
          element.removeAttribute("lwt-toolbar-field-focus-brighttext");
          return null;
        }
        const { r, g, b, a } = rgbaChannels;
        if (_isColorDark(r, g, b)) {
          element.removeAttribute("lwt-toolbar-field-focus-brighttext");
        } else {
          element.setAttribute("lwt-toolbar-field-focus-brighttext", "true");
        }
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      },
    },
  ],
  [
    "--toolbar-field-focus-border-color",
    {
      lwtProperty: "toolbar_field_border_focus",
    },
  ],
  [
    "--lwt-toolbar-field-highlight",
    {
      lwtProperty: "toolbar_field_highlight",
      processColor(rgbaChannels: any, element: any) {
        if (!rgbaChannels) {
          element.removeAttribute("lwt-selection");
          return null;
        }
        element.setAttribute("lwt-selection", "true");
        const { r, g, b, a } = rgbaChannels;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      },
    },
  ],
  [
    "--lwt-toolbar-field-highlight-text",
    {
      lwtProperty: "toolbar_field_highlight_text",
    },
  ],
];

function _isColorDark(r: number, g: number, b: number) {
  return 0.2125 * r + 0.7154 * g + 0.0721 * b <= 110;
}

const hexToRGB = (hex: string) => {
  if (hex.length !== 6) return [255, 255, 255];

  const parts = hex.match(/.{1,2}/g);

  if (!parts) return [255, 255, 255];

  return [
    parseInt(parts[0], 16),
    parseInt(parts[1], 16),
    parseInt(parts[2], 16)
  ];
}

const hslToRGB = (h: number, s: number, l: number) => {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const toRGB = (colour: string): number[] => {
  let type: 'hex' | 'hsl' | 'rgb' | undefined;

  if (colour.startsWith("#")) type = "hex";
  else if (colour.match(/0[xX][0-9a-fA-F]+/)) type = "hex";
  else if (colour.startsWith("rgb")) type = "rgb";
  else if (colour.startsWith("hsl")) type = "hsl";
  else {
    return [255, 255, 255];
  }

  switch (type) {
    case "hex":
      return hexToRGB(colour.replace(/#/, ""));
    case "rgb":
      return colour
        .replace(/rgb\(/g, "")
        .replace(/\)/g, "")
        .split(",")
        .map(i => parseInt(i));
    case "hsl":
      const hsl = colour
        .replace(/rgb\(/g, "")
        .replace(/\)/g, "")
        .split(",")
        .map(i => parseInt(i));

      const h = hsl[0];
      const s = hsl[1];
      const l = hsl[2];

      return hslToRGB(h, s, l);
    default:
      return [255, 255, 255];
  }
}

export class ThemeAPI {
  public isSystemDarkMode = false;
  public isThemeDynamic: boolean = false;

  private _currentTheme: any = null;
  private _currentThemeExperiments: any = null;
  private _currentThemeId = null;

  private _darkModeMediaQuery: MediaQueryList;

  get theme() {
    return this._currentTheme;
  }

  get themeId() {
    if (!this._currentThemeId) return null;
    return this._currentThemeId;
  }

  public startWatchingAccent() {
    dot.prefs.observe(
      "dot.ui.accent_colour",
      (value: string) => {
        const cleansedValue = value.replace(/ /g, "").toLowerCase();

        dot.window.removeWindowClassByNamespace("accent-colour-", document.documentElement)
        dot.window.addWindowClass(
          `accent-colour-${cleansedValue}`,
          true,
          document.documentElement
        )
      },
      true
    );
  }

  public load() {
    this.startWatchingAccent();

    const { themeData } = LightweightThemeManager;

    if (this._currentThemeId) {
      dot.window.removeWindowClassByNamespace("theme-");
      dot.window.addWindowClass(`theme-${this._currentThemeId}`);
    }

    if (themeData.theme) {
      this._currentTheme = this.isSystemDarkMode && themeData.darkTheme
        ? themeData.darkTheme
        : themeData.theme;

      this._currentThemeId = themeData.theme.id;
      this._currentThemeExperiments = this._currentTheme.experimental;

      this.isThemeDynamic = !!themeData.darkTheme;

      const mapped = [...ThemeVariableMap, ...toolkitVariableMap].map((i: any) => {
        return { variable: i[0], data: i[1] }
      });

      for (const [key, value] of Object.entries(this._currentTheme)) {
        if (
          key == "experimental" ||
          key == "id" ||
          key == "version"
        ) continue;

        const index = mapped.findIndex(({ data }: { data: any }) =>
          data.lwtProperty == key
        );

        if (mapped[index]) {
          const { variable } = mapped[index];

          document.documentElement.style.setProperty(
            variable.replace(/_/g, "-"),
            `${value}`
          )
        } else {
          document.documentElement.style.setProperty(
            "--" + key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/_/g, "-"),
            `${value}`
          )
        }
      }

      if (this._currentThemeExperiments) {
        for (const [key, value] of Object.entries(this._currentThemeExperiments.colors)) {
          document.documentElement.style.setProperty(
            `--` + key.replace(/_/g, "-").toLowerCase(),
            `${value}`
          )
        };
      }

      this.determineDarkness();
    } else {
      this.setTheme(Services.builtInThemes.DEFAULT_THEME_ID);
    }
  }

  public async setTheme(id: string) {
    await this.awaitAddonManagerStartup();

    const addon = await AddonManager.getAddonByID(id);
    addon.enable();
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
      this.theme.toolbarColor,
      this.theme.accentcolor
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