/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const ThemeVariableMap = [
	[
		"--lwt-accent-color-inactive",
		{
			lwtProperty: "accentcolorInactive"
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
			lwtProperty: "tab_loading"
		}
	],
	[
		"--lwt-tab-text",
		{
			lwtProperty: "tab_text"
		}
	],
	[
		"--lwt-tab-line-color",
		{
			lwtProperty: "tab_line"
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
			lwtProperty: "toolbarColor"
		}
	],
	[
		"--toolbar-color",
		{
			lwtProperty: "toolbar_text"
		}
	],
	[
		"--lwt-tabs-border-color",
		{
			lwtProperty: "toolbar_top_separator"
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
			lwtProperty: "icon_color"
		}
	],
	[
		"--lwt-toolbarbutton-icon-fill-attention",
		{
			lwtProperty: "icon_attention_color"
		}
	],
	[
		"--lwt-toolbarbutton-hover-background",
		{
			lwtProperty: "button_background_hover"
		}
	],
	[
		"--lwt-toolbarbutton-active-background",
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
		"--arrowpanel-border-color",
		{
			lwtProperty: "popup_border"
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
			lwtProperty: "sidebar"
		}
	],
	[
		"--sidebar-text-color",
		{
			lwtProperty: "sidebar_text",
			processColor(rgbaChannels, element) {
				if (!rgbaChannels) {
					element.removeAttribute("lwt-tree");
					element.removeAttribute("lwt-tree-brighttext");
					return null;
				}

				const { r, g, b } = rgbaChannels;
				const luminance = 0.2125 * r + 0.7154 * g + 0.0721 * b;
				const brighttext = luminance > 110;

				element.setAttribute("lwt-tree", "true");
				if (!brighttext) {
					element.removeAttribute("lwt-tree-brighttext");
				} else {
					element.setAttribute("lwt-tree-brighttext", "true");
				}

				// Drop alpha channel.
				return `rgb(${r}, ${g}, ${b})`;
			}
		}
	],
	[
		"--sidebar-highlight-background-color",
		{
			lwtProperty: "sidebar_highlight"
		}
	],
	[
		"--sidebar-highlight-text-color",
		{
			lwtProperty: "sidebar_highlight_text"
		}
	],
	[
		"--sidebar-border-color",
		{
			lwtProperty: "sidebar_border"
		}
	],
	[
		"--browser-frame-background-color",
		{
			lwtProperty: "ntp_background",
			processColor(rgbaChannels) {
				if (!rgbaChannels) return null;

				// Drop alpha channel
				let { r, g, b } = rgbaChannels;
				return `rgb(${r}, ${g}, ${b})`;
			}
		}
	]
];

export const ThemeContentPropertyList = [
	"ntp_background",
	"ntp_text",
	"sidebar",
	"sidebar_highlight",
	"sidebar_highlight_text",
	"sidebar_text"
];
