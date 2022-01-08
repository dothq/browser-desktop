import { Services } from "mozilla";
import { isColourDark } from "./utils";

// combined version that includes toolkitVariableMap
export const ThemeVariableMap = [
    [
        "--lwt-accent-color",
        {
            lwtProperty: "frame",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (
                    !rgbaChannels ||
                    rgbaChannels.a == 0
                ) {
                    return "white";
                }
                // Remove the alpha channel
                const { r, g, b } = rgbaChannels;
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
    ],
    [
        "--lwt-text-color",
        {
            lwtProperty: "tab_background_text",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (!rgbaChannels) {
                    rgbaChannels = { r: 0, g: 0, b: 0 };
                }
                // Remove the alpha channel
                const { r, g, b } = rgbaChannels;
                element.setAttribute(
                    "lwthemetextcolor",
                    isColourDark(r, g, b)
                        ? "dark"
                        : "bright"
                );
                return `rgba(${r}, ${g}, ${b})`;
            }
        }
    ],
    [
        "--arrowpanel-background",
        {
            lwtProperty: "popup"
        }
    ],
    [
        "--arrowpanel-color",
        {
            lwtProperty: "popup_text",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                const disabledColorVariable =
                    "--panel-disabled-color";
                const descriptionColorVariable =
                    "--panel-description-color";

                if (!rgbaChannels) {
                    element.removeAttribute(
                        "lwt-popup-brighttext"
                    );
                    element.style.removeProperty(
                        disabledColorVariable
                    );
                    element.style.removeProperty(
                        descriptionColorVariable
                    );
                    return null;
                }

                let { r, g, b, a } = rgbaChannels;

                if (isColourDark(r, g, b)) {
                    element.removeAttribute(
                        "lwt-popup-brighttext"
                    );
                } else {
                    element.setAttribute(
                        "lwt-popup-brighttext",
                        "true"
                    );
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
            }
        }
    ],
    [
        "--arrowpanel-border-color",
        {
            lwtProperty: "popup_border"
        }
    ],
    [
        "--lwt-toolbar-field-background-color",
        {
            lwtProperty: "toolbar_field"
        }
    ],
    [
        "--lwt-toolbar-field-color",
        {
            lwtProperty: "toolbar_field_text",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (!rgbaChannels) {
                    element.removeAttribute(
                        "lwt-toolbar-field-brighttext"
                    );
                    return null;
                }
                const { r, g, b, a } = rgbaChannels;
                if (isColourDark(r, g, b)) {
                    element.removeAttribute(
                        "lwt-toolbar-field-brighttext"
                    );
                } else {
                    element.setAttribute(
                        "lwt-toolbar-field-brighttext",
                        "true"
                    );
                }
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
    ],
    [
        "--lwt-toolbar-field-border-color",
        {
            lwtProperty: "toolbar_field_border"
        }
    ],
    [
        "--lwt-toolbar-field-focus",
        {
            lwtProperty: "toolbar_field_focus",
            fallbackProperty: "toolbar_field",
            processColor(
                rgbaChannels: any,
                element: any,
                propertyOverrides: any
            ) {
                // Ensure minimum opacity as this is used behind address bar results.
                if (!rgbaChannels) {
                    propertyOverrides.set(
                        "toolbar_field_text_focus",
                        "black"
                    );
                    return "white";
                }
                const min_opacity = 0.9;
                let { r, g, b, a } = rgbaChannels;
                if (a < min_opacity) {
                    propertyOverrides.set(
                        "toolbar_field_text_focus",
                        isColourDark(r, g, b)
                            ? "white"
                            : "black"
                    );
                    return `rgba(${r}, ${g}, ${b}, ${min_opacity})`;
                }
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
    ],
    [
        "--lwt-toolbar-field-focus-color",
        {
            lwtProperty: "toolbar_field_text_focus",
            fallbackProperty: "toolbar_field_text",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (!rgbaChannels) {
                    element.removeAttribute(
                        "lwt-toolbar-field-focus-brighttext"
                    );
                    return null;
                }
                const { r, g, b, a } = rgbaChannels;
                if (isColourDark(r, g, b)) {
                    element.removeAttribute(
                        "lwt-toolbar-field-focus-brighttext"
                    );
                } else {
                    element.setAttribute(
                        "lwt-toolbar-field-focus-brighttext",
                        "true"
                    );
                }
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
    ],
    [
        "--toolbar-field-focus-border-color",
        {
            lwtProperty: "toolbar_field_border_focus"
        }
    ],
    [
        "--lwt-toolbar-field-highlight",
        {
            lwtProperty: "toolbar_field_highlight",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (!rgbaChannels) {
                    element.removeAttribute(
                        "lwt-selection"
                    );
                    return null;
                }
                element.setAttribute(
                    "lwt-selection",
                    "true"
                );
                const { r, g, b, a } = rgbaChannels;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
    ],
    [
        "--lwt-toolbar-field-highlight-text",
        {
            lwtProperty: "toolbar_field_highlight_text"
        }
    ],
    [
        "--lwt-accent-color-inactive",
        {
            lwtProperty: "frame_inactive"
        }
    ],
    [
        "--lwt-background-alignment",
        {
            isColor: false,
            lwtProperty: "backgroundsAlignment"
        }
    ],
    [
        "--lwt-background-tiling",
        {
            isColor: false,
            lwtProperty: "backgroundsTiling"
        }
    ],
    [
        "--tab-loading-fill",
        {
            lwtProperty: "tab_loading",
            optionalElementID: "tabbrowser-tabs"
        }
    ],
    [
        "--lwt-tab-text",
        {
            lwtProperty: "tab_text"
        }
    ],
    [
        "--tab-line-color",
        {
            lwtProperty: "tab_line",
            optionalElementID: "tabbrowser-tabs"
        }
    ],
    [
        "--lwt-background-tab-separator-color",
        {
            lwtProperty: "tab_background_separator"
        }
    ],
    [
        "--toolbar-bgcolor",
        {
            lwtProperty: "toolbar",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (!rgbaChannels) {
                    Services.prefs.setIntPref(
                        "browser.theme.toolbar-theme",
                        2
                    );
                    return null;
                }
                const { r, g, b, a } = rgbaChannels;
                Services.prefs.setIntPref(
                    "browser.theme.toolbar-theme",
                    isColourDark(r, g, b) ? 0 : 1
                );
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
    ],
    [
        "--toolbar-color",
        {
            lwtProperty: "toolbar_text"
        }
    ],
    [
        "--tabs-border-color",
        {
            lwtProperty: "toolbar_top_separator",
            optionalElementID: "navigator-toolbox"
        }
    ],
    [
        "--toolbarseparator-color",
        {
            lwtProperty: "toolbar_vertical_separator"
        }
    ],
    [
        "--chrome-content-separator-color",
        {
            lwtProperty: "toolbar_bottom_separator"
        }
    ],
    [
        "--toolbarbutton-icon-fill",
        {
            lwtProperty: "icons"
        }
    ],
    [
        "--lwt-toolbarbutton-icon-fill-attention",
        {
            lwtProperty: "icons_attention"
        }
    ],
    [
        "--toolbarbutton-hover-background",
        {
            lwtProperty: "button_background_hover"
        }
    ],
    [
        "--toolbarbutton-active-background",
        {
            lwtProperty: "button_background_active"
        }
    ],
    [
        "--lwt-selected-tab-background-color",
        {
            lwtProperty: "tab_selected"
        }
    ],
    [
        "--autocomplete-popup-background",
        {
            lwtProperty: "popup"
        }
    ],
    [
        "--autocomplete-popup-color",
        {
            lwtProperty: "popup_text"
        }
    ],
    [
        "--autocomplete-popup-highlight-background",
        {
            lwtProperty: "popup_highlight"
        }
    ],
    [
        "--autocomplete-popup-highlight-color",
        {
            lwtProperty: "popup_highlight_text"
        }
    ],
    [
        "--sidebar-background-color",
        {
            lwtProperty: "sidebar",
            optionalElementID: "sidebar-box",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (!rgbaChannels) {
                    element.removeAttribute(
                        "lwt-sidebar"
                    );
                    return null;
                }
                const { r, g, b } = rgbaChannels;
                element.setAttribute(
                    "lwt-sidebar",
                    "true"
                );
                // Drop alpha channel
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
    ],
    [
        "--sidebar-text-color",
        {
            lwtProperty: "sidebar_text",
            optionalElementID: "sidebar-box"
        }
    ],
    [
        "--sidebar-border-color",
        {
            lwtProperty: "sidebar_border",
            optionalElementID: "browser"
        }
    ],
    [
        "--newtab-background-color",
        {
            lwtProperty: "ntp_background"
        }
    ],
    [
        "--newtab-text-primary-color",
        {
            lwtProperty: "ntp_text",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                element.setAttribute(
                    "lwt-newtab",
                    "true"
                );
                const { r, g, b, a } = rgbaChannels;
                element.toggleAttribute(
                    "lwt-newtab-brighttext",
                    !isColourDark(r, g, b)
                );

                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
    ],
    [
        "--lwt-sidebar-background-color",
        {
            lwtProperty: "sidebar",
            processColor(rgbaChannels: any) {
                if (!rgbaChannels) {
                    return null;
                }
                const { r, g, b } = rgbaChannels;
                // Drop alpha channel
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
    ],
    [
        "--lwt-sidebar-text-color",
        {
            lwtProperty: "sidebar_text",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (!rgbaChannels) {
                    element.removeAttribute(
                        "lwt-sidebar"
                    );
                    element.removeAttribute(
                        "lwt-sidebar-brighttext"
                    );
                    return null;
                }

                element.setAttribute(
                    "lwt-sidebar",
                    "true"
                );
                const { r, g, b, a } = rgbaChannels;
                if (!isColourDark(r, g, b)) {
                    element.setAttribute(
                        "lwt-sidebar-brighttext",
                        "true"
                    );
                } else {
                    element.removeAttribute(
                        "lwt-sidebar-brighttext"
                    );
                }

                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
    ],
    [
        "--lwt-sidebar-highlight-background-color",
        {
            lwtProperty: "sidebar_highlight"
        }
    ],
    [
        "--lwt-sidebar-highlight-text-color",
        {
            lwtProperty: "sidebar_highlight_text",
            processColor(
                rgbaChannels: any,
                element: any
            ) {
                if (!rgbaChannels) {
                    element.removeAttribute(
                        "lwt-sidebar-highlight"
                    );
                    return null;
                }
                element.setAttribute(
                    "lwt-sidebar-highlight",
                    "true"
                );

                const { r, g, b, a } = rgbaChannels;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
    ]
].map((i: any) => {
    return { variable: i[0], data: i[1] };
});