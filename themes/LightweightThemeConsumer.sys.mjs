/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

// Get the app theme variables from the app resource directory.
var { ThemeVariableMap, ThemeContentPropertyList } = ChromeUtils.importESModule(
	"resource:///modules/ThemeVariableMap.sys.mjs"
);

var { ToolkitVariableMap } = ChromeUtils.importESModule(
	"resource:///modules/ToolkitVariableMap.sys.mjs"
);

// Declare the default theme ID (this should never change)
const DEFAULT_THEME_ID = "default-theme@mozilla.org";

const BROWSER_CONTENT_THEME_PREF_ID = "browser.theme.content-theme";
const BROWSER_TOOLBAR_THEME_PREF_ID = "browser.theme.toolbar-theme";
const BROWSER_UNIFIED_THEME_PREF_ID = "browser.theme.unified-color-scheme";

const BROWSER_THEME_DARK = 0;
const BROWSER_THEME_LIGHT = 1;
const BROWSER_THEME_SYSTEM = 2;

const DEFAULT_THEME_RESPECTS_SYSTEM_COLOR_SCHEME =
	AppConstants.platform == "linux";

const kInvalidColor = { r: 0, g: 0, b: 0, a: 1 };

/**
 * Converts a CSS color to RGBA format
 * @param {Document} doc
 * @param {string} cssColor
 * @returns {{ r: Number, g: Number, b: Number, a: Number } | null}
 */
function cssColorToRGBA(doc, cssColor) {
	if (!cssColor) {
		return null;
	}
	return (
		doc.defaultView.InspectorUtils.colorToRGBA(cssColor, doc) ||
		kInvalidColor
	);
}

/**
 * Converts an RGBA color to a string
 * @param {{ r: Number, g: Number, b: Number, a: Number }} parsedColor
 * @returns {string}
 */
function rgbaToString(parsedColor) {
	if (!parsedColor) {
		return null;
	}

	const { r, g, b, a } = parsedColor;

	if (a == 1) {
		return `rgb(${r}, ${g}, ${b})`;
	}

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Determines if a themed color pair should be considered to have a dark color
 * scheme. We consider both the background and foreground (i.e. usually text)
 * colors because some text colors can be dark enough for our heuristics, but
 * still contrast well enough with a dark background
 * @param {Document} doc
 * @param {object} colors
 * @param {string} textPropertyName
 *   The key for the foreground element in `colors`.
 * @param {string} backgroundPropertyName
 *   The key for the background element in `colors`.
 * @returns {boolean} True if the element should be considered dark, false
 *   otherwise.
 */
function determineIfColorPairIsDark(
	doc,
	colors,
	textPropertyName,
	backgroundPropertyName
) {
	if (!colors[backgroundPropertyName] && !colors[textPropertyName]) {
		// Handles the system theme.
		return false;
	}

	let color = cssColorToRGBA(doc, colors[backgroundPropertyName]);
	if (color && color.a == 1) {
		return isColorDark(color.r, color.g, color.b);
	}

	color = cssColorToRGBA(doc, colors[textPropertyName]);
	if (!color) {
		// Handles the case where a theme only provides a background color and it is
		// semi-transparent.
		return false;
	}

	return !isColorDark(color.r, color.g, color.b);
}

/**
 * Sets dark mode attributes on root, if required. We must do this here,
 * instead of in each color's processColor function, because multiple colors
 * are considered.
 * @param {Document} doc
 * @param {Element} root
 * @param {object} colors
 *   The `processedColors` object from the object created for our theme.
 */
function setDarkModeAttributes(doc, root, colors) {
	{
		let textColor = cssColorToRGBA(doc, colors.textcolor);
		if (textColor && !isColorDark(textColor.r, textColor.g, textColor.b)) {
			root.setAttribute("lwtheme-brighttext", "true");
		} else {
			root.removeAttribute("lwtheme-brighttext");
		}
	}

	if (
		determineIfColorPairIsDark(
			doc,
			colors,
			"toolbar_field_text",
			"toolbar_field"
		)
	) {
		root.setAttribute("lwt-toolbar-field-brighttext", "true");
	} else {
		root.removeAttribute("lwt-toolbar-field-brighttext");
	}

	if (
		determineIfColorPairIsDark(
			doc,
			colors,
			"toolbar_field_text_focus",
			"toolbar_field_focus"
		)
	) {
		root.setAttribute("lwt-toolbar-field-focus-brighttext", "true");
	} else {
		root.removeAttribute("lwt-toolbar-field-focus-brighttext");
	}

	if (determineIfColorPairIsDark(doc, colors, "popup_text", "popup")) {
		root.setAttribute("lwt-popup-brighttext", "true");
	} else {
		root.removeAttribute("lwt-popup-brighttext");
	}
}

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

/**
 * Sets a CSS property to an element
 * @param {HTMLElement} elem
 * @param {boolean} active
 * @param {string} variableName
 * @param {any} value
 */
function setProperty(elem, active, variableName, value) {
	if (active && value) {
		elem.style.setProperty(variableName, value);
	} else {
		elem.style.removeProperty(variableName);
	}
}

function setProperties(root, active, themeData) {
	let propertyOverrides = new Map();
	let doc = root.ownerDocument;

	// Copy the theme into _processedColors. We'll replace values with processed
	// colors if necessary. We copy because some colors (such as those used in
	// content) are not processed here, but are referenced in places that check
	// _processedColors. Copying means _processedColors will contain irrelevant
	// properties like `id`. There aren't too many, so that's OK.
	themeData._processedColors = { ...themeData };

	for (const map of [ToolkitVariableMap, ThemeVariableMap]) {
		for (const [cssVarName, definition] of map) {
			const {
				lwtProperty,
				fallbackProperty,
				optionalElementID,
				processColor,
				isColor = true
			} = definition;

			const elem = optionalElementID
				? doc.getElementById(optionalElementID)
				: root;
			let val =
				propertyOverrides.get(lwtProperty) || themeData[lwtProperty];

			if (isColor) {
				val = cssColorToRGBA(doc, val);

				if (!val && fallbackProperty) {
					val = cssColorToRGBA(doc, themeData[fallbackProperty]);
				}

				if (processColor) {
					val = processColor(val, elem, propertyOverrides);
				} else {
					val = rgbaToString(val);
				}
			}

			// Add processed color to themeData.
			themeData._processedColors[lwtProperty] = val;

			setProperty(elem, active, cssVarName, val);
		}
	}
}

/**
 * Gets all allowed content properties for themeing
 * @param {Document} doc
 * @param {boolean} active
 * @param {any} data
 * @returns
 */
function getContentProperties(doc, active, data) {
	if (!active) return {};

	let properties = {};
	for (let property in data) {
		if (ThemeContentPropertyList.includes(property)) {
			properties[property] = cssColorToRGBA(doc, data[property]);
		}
	}

	if (data.experimental) {
		for (const property in data.experimental.colors) {
			if (ThemeContentPropertyList.includes(property)) {
				properties[property] = cssColorToRGBA(
					doc,
					data.experimental.colors[property]
				);
			}
		}
		for (const property in data.experimental.images) {
			if (ThemeContentPropertyList.includes(property)) {
				properties[
					property
				] = `url(${data.experimental.images[property]})`;
			}
		}
		for (const property in data.experimental.properties) {
			if (ThemeContentPropertyList.includes(property)) {
				properties[property] = data.experimental.properties[property];
			}
		}
	}

	return properties;
}

/**
 * Sets an image in the window from a theme
 * @param {Window} win
 * @param {HTMLElement} root
 * @param {boolean} active
 * @param {string} variableName
 * @param {string[]} urls
 */
function setImage(win, root, active, variableName, urls) {
	if (urls && !Array.isArray(urls)) {
		urls = [urls];
	}

	setProperty(
		root,
		active,
		variableName,
		urls && urls.map((v) => `url(${win.CSS.escape(v)})`).join(", ")
	);
}

/**
 * LightweightThemeConsumer initialises and sets the
 * LWT variables from the enabled theme.
 *
 * @constructor
 * @param {Document} document - The document to theme.
 */
export class LightweightThemeConsumer {
	constructor(document) {
		this._doc = document;
		this._win = document.defaultView;
		this._winId = this._win.docShell.outerWindowID;

		Services.obs.addObserver(this, "lightweight-theme-styling-update");

		this.darkThemeMediaQuery = this._win.matchMedia(
			"(-moz-system-dark-theme)"
		);
		this.darkThemeMediaQuery.addListener(this);

		const { LightweightThemeManager } = ChromeUtils.importESModule(
			"resource://gre/modules/LightweightThemeManager.sys.mjs"
		);
		this._update(LightweightThemeManager.themeData);

		this._win.addEventListener("unload", this, { once: true });
	}

	observe(subject, topic) {
		if (topic != "lightweight-theme-styling-update") {
			return;
		}

		let data = subject.wrappedJSObject;
		if (data.window && data.window !== this._winId) {
			return;
		}

		this._update(data);
	}

	handleEvent(event) {
		if (event.target == this.darkThemeMediaQuery) {
			this._update(this._lastData);
			return;
		}

		switch (event.type) {
			case "unload":
				Services.obs.removeObserver(
					this,
					"lightweight-theme-styling-update"
				);
				Services.ppmm.sharedData.delete(`theme/${this._winId}`);
				this._win = this._doc = null;

				if (this.darkThemeMediaQuery) {
					this.darkThemeMediaQuery.removeListener(this);
					this.darkThemeMediaQuery = null;
				}

				break;
		}
	}

	determineInterfaceTheme(
		doc,
		theme,
		hasDarkTheme = false,
		isDarkTheme = false
	) {
		const colors = theme?._processedColors;

		// This function is needed to check whether the color is too dark for the foreground
		// If it is too dark, we need to use a light color scheme, otherwise use a dark color scheme.
		function prefValue(color, isForeground = false) {
			if (typeof color != "object") {
				color = cssColorToRGBA(doc, color);
			}
			return isColorDark(color.r, color.g, color.b) == isForeground
				? BROWSER_THEME_LIGHT
				: BROWSER_THEME_DARK;
		}

		// This is needed to convert the properties.color_scheme value in theme manifests
		// to the preference value for browser.theme.x_theme prefs
		function getColorSchemeFromThemedValue(colorScheme) {
			if (!colorScheme) return null;

			switch (colorScheme) {
				case "dark":
					return BROWSER_THEME_DARK;
				case "light":
					return BROWSER_THEME_LIGHT;
				case "system":
					return BROWSER_THEME_SYSTEM;
				case "auto":
				default:
					break;
			}

			return null;
		}

		const getToolbarTheme = () => {
			// When there is no theme argument, we are using the default theme
			// So we will return the system toolbar theme instead
			if (!theme) {
				if (!DEFAULT_THEME_RESPECTS_SYSTEM_COLOR_SCHEME) {
					return BROWSER_THEME_LIGHT;
				}
				return BROWSER_THEME_SYSTEM;
			}

			const colorScheme = getColorSchemeFromThemedValue(
				theme.color_scheme
			);

			// If we have a valid color scheme, return it
			if (colorScheme !== null) return colorScheme;

			// Check if our theme has the darkTheme value in the manifest
			// Then check if we're in dark mode and return the respective value
			if (hasDarkTheme) {
				return isDarkTheme ? BROWSER_THEME_DARK : BROWSER_THEME_LIGHT;
			}

			// Check the toolbarColor to see if it is light enough for dark color scheme.
			if (colors.toolbarColor) {
				let color = cssColorToRGBA(doc, colors.toolbarColor);
				if (color.a == 1) {
					return prefValue(color);
				}
			}

			// Check the toolbar text color to see if it is dark enough for a light color scheme.
			if (colors.toolbar_text) {
				return prefValue(
					colors.toolbar_text,
					/* aIsForeground = */ true
				);
			}

			// Check the text color of the theme, if it isn't set use black and check if it is
			// dark enough for a light color scheme.
			return prefValue(
				colors.textcolor || "black",
				/* aIsForeground = */ true
			);
		};

		const getContentTheme = () => {
			// Check if we use a unified theme setup
			const usesUnifiedTheme = Services.prefs.getBoolPref(
				BROWSER_UNIFIED_THEME_PREF_ID,
				true
			);

			// Use the toolbar theme when we're on a unified theme setup
			if (usesUnifiedTheme) {
				return getToolbarTheme();
			}

			// We can assume we are using the default theme here
			if (!theme) {
				if (!DEFAULT_THEME_RESPECTS_SYSTEM_COLOR_SCHEME) {
					return BROWSER_THEME_LIGHT;
				}
				return BROWSER_THEME_SYSTEM;
			}

			// Check the color scheme of our current theme from the manifest
			const colorScheme = getColorSchemeFromThemedValue(
				theme.content_color_scheme || theme.color_scheme
			);

			// If we have a colorScheme from the theme, use that
			if (colorScheme !== null) {
				return colorScheme;
			}

			// Otherwise, just use the system theme
			return BROWSER_THEME_SYSTEM;
		};

		// Set the prefs
		Services.prefs.setIntPref(
			BROWSER_CONTENT_THEME_PREF_ID,
			getToolbarTheme()
		);
		Services.prefs.setIntPref(
			BROWSER_TOOLBAR_THEME_PREF_ID,
			getContentTheme()
		);
	}

	/**
	 * Updates the lightweight theme
	 * @param {*} themeData
	 */
	_update(themeData) {
		this._lastData = themeData;

		const hasDarkTheme = !!themeData.darkTheme;

		let updateGlobalThemeData = true;
		let useDarkTheme = (() => {
			// If we don't have a dark theme, we can't use it
			if (!hasDarkTheme) {
				return false;
			}

			// Checks if the OS's theme is dark
			if (this.darkThemeMediaQuery?.matches) {
				return (
					themeData.darkTheme.id != DEFAULT_THEME_ID ||
					!DEFAULT_THEME_RESPECTS_SYSTEM_COLOR_SCHEME
				);
			}

			return false;
		})();

		// If this is a per-window dark theme, set the color scheme override so
		// child BrowsingContexts, such as embedded prompts, get themed
		// appropriately.
		// If not, reset the color scheme override field. This is required to reset
		// the color scheme on theme switch.
		if (this._win.browsingContext == this._win.browsingContext.top) {
			if (useDarkTheme && !updateGlobalThemeData) {
				this._win.browsingContext.prefersColorSchemeOverride = "dark";
			} else {
				this._win.browsingContext.prefersColorSchemeOverride = "none";
			}
		}

		// Gets the appropriate theme
		let theme = useDarkTheme ? themeData.darkTheme : themeData.theme;
		if (!theme) {
			theme = { id: DEFAULT_THEME_ID };
		}

		let active = (this._active = Object.keys(theme).length);

		let root = this._doc.documentElement;

		if (active && theme.headerURL) {
			root.setAttribute("lwtheme-image", "true");
		} else {
			root.removeAttribute("lwtheme-image");
		}

		this._setExperiment(active, themeData.experiment, theme.experimental);
		setImage(
			this._win,
			root,
			!!active,
			"--lwt-header-image",
			theme.headerURL
		);
		setImage(
			this._win,
			root,
			!!active,
			"--lwt-additional-images",
			theme.additionalBackgrounds
		);
		setProperties(root, active, theme);

		if (theme.id != DEFAULT_THEME_ID || useDarkTheme) {
			if (updateGlobalThemeData) {
				this.determineInterfaceTheme(
					this._doc,
					theme,
					hasDarkTheme,
					useDarkTheme
				);
			}
			root.setAttribute("lwtheme", "true");
		} else {
			this.determineInterfaceTheme(this._doc, null);
			root.removeAttribute("lwtheme");
		}

		if (theme.id == DEFAULT_THEME_ID && useDarkTheme) {
			root.setAttribute("lwt-default-theme-in-dark-mode", "true");
		} else {
			root.removeAttribute("lwt-default-theme-in-dark-mode");
		}

		setDarkModeAttributes(this._doc, root, theme._processedColors);

		const contentThemeData = getContentProperties(
			this._doc,
			!!active,
			theme
		);

		Services.ppmm.sharedData.set(`theme/${this._winId}`, contentThemeData);
		// We flush sharedData because contentThemeData can be responsible for
		// painting large background surfaces. If this data isn't delivered to the
		// content process before about:home is painted, we will paint a default
		// background and then replace it when sharedData syncs, causing flashing.
		Services.ppmm.sharedData.flush();

		this._win.dispatchEvent(new CustomEvent("windowlwthemeupdate"));
	}

	_setExperiment(active, experiment, properties) {
		const root = this._doc.documentElement;

		if (this._lastExperimentData) {
			const { stylesheet, usedVariables } = this._lastExperimentData;
			if (stylesheet) {
				stylesheet.remove();
			}
			if (usedVariables) {
				for (const [variable] of usedVariables) {
					setProperty(root, false, variable);
				}
			}
		}

		this._lastExperimentData = {};

		if (!active || !experiment) {
			return;
		}

		let usedVariables = [];

		if (properties.colors) {
			for (const property in properties.colors) {
				const cssVariable = experiment.colors[property];
				const value = rgbaToString(
					cssColorToRGBA(
						root.ownerDocument,
						properties.colors[property]
					)
				);
				usedVariables.push([cssVariable, value]);
			}
		}

		if (properties.images) {
			for (const property in properties.images) {
				const cssVariable = experiment.images[property];
				usedVariables.push([
					cssVariable,
					`url(${properties.images[property]})`
				]);
			}
		}

		if (properties.properties) {
			for (const property in properties.properties) {
				const cssVariable = experiment.properties[property];
				usedVariables.push([
					cssVariable,
					properties.properties[property]
				]);
			}
		}

		for (const [variable, value] of usedVariables) {
			setProperty(root, true, variable, value);
		}

		this._lastExperimentData.usedVariables = usedVariables;

		if (experiment.stylesheet) {
			/* Stylesheet URLs are validated using WebExtension schemas */
			let stylesheetAttr = `href="${experiment.stylesheet}" type="text/css"`;
			let stylesheet = this._doc.createProcessingInstruction(
				"xml-stylesheet",
				stylesheetAttr
			);
			this._doc.insertBefore(stylesheet, root);
			this._lastExperimentData.stylesheet = stylesheet;
		}
	}
}
