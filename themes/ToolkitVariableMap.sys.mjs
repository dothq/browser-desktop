/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Determines whether a color is dark or light
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns boolean
 */
function isColorDark(r, g, b) {
	return 0.2125 * r + 0.7154 * g + 0.0721 * b <= 127;
}

export const ToolkitVariableMap = [
	[
		"--lwt-accent-color",
		{
			lwtProperty: "accentcolor",
			processColor(rgbaChannels, element) {
				if (!rgbaChannels || rgbaChannels.a == 0) {
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
			lwtProperty: "textcolor",
			processColor(rgbaChannels, element) {
				if (!rgbaChannels) {
					rgbaChannels = { r: 0, g: 0, b: 0 };
				}
				// Remove the alpha channel
				const { r, g, b } = rgbaChannels;
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
			processColor(rgbaChannels, element) {
				const disabledColorVariable = "--panel-disabled-color";
				const descriptionColorVariable = "--panel-description-color";

				if (!rgbaChannels) {
					element.style.removeProperty(disabledColorVariable);
					element.style.removeProperty(descriptionColorVariable);
					return null;
				}

				let { r, g, b, a } = rgbaChannels;

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
		"--toolbar-field-background-color",
		{
			lwtProperty: "toolbar_field"
		}
	],
	[
		"--toolbar-field-color",
		{
			lwtProperty: "toolbar_field_text"
		}
	],
	[
		"--toolbar-field-border-color",
		{
			lwtProperty: "toolbar_field_border"
		}
	],
	[
		"--toolbar-field-focus-background-color",
		{
			lwtProperty: "toolbar_field_focus",
			fallbackProperty: "toolbar_field",
			processColor(rgbaChannels, element, propertyOverrides) {
				if (!rgbaChannels) {
					return null;
				}
				// Ensure minimum opacity as this is used behind address bar results.
				const min_opacity = 0.9;
				let { r, g, b, a } = rgbaChannels;
				if (a < min_opacity) {
					propertyOverrides.set(
						"toolbar_field_text_focus",
						isColorDark(r, g, b) ? "white" : "black"
					);
					return `rgba(${r}, ${g}, ${b}, ${min_opacity})`;
				}
				return `rgba(${r}, ${g}, ${b}, ${a})`;
			}
		}
	],
	[
		"--toolbar-field-focus-color",
		{
			lwtProperty: "toolbar_field_text_focus",
			fallbackProperty: "toolbar_field_text"
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
			processColor(rgbaChannels, element) {
				if (!rgbaChannels) {
					return null;
				}
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
	]
];
