/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
	CustomisableUIArea,
	CustomisableUIAreaOrientation,
	CustomisableUIAreaType,
	CustomisableUIContextType
} from "./CustomisableUIArea.js";
import { CustomisableUISerialisedConfiguration } from "./CustomisableUIConfig.js";
import {
	CustomisableUIPlacement,
	CustomisableUIPlacementProperties
} from "./CustomisableUIPlacement.js";
import { CustomisableUIWidgetSource } from "./CustomisableUIWidgets.js";
import { CustomizableWidgets } from "./widgets";
import Widget from "./widgets/common";

export interface CustomisableUIBaseEntity {
	/**
	 * Determines whether the entity should be visible
	 */
	visible: boolean;
}

class _CustomisableUIInternal {
	/**
	 * The current version. We can use this to auto-add new default widgets as necessary.
	 */
	private kVersion = 0;

	/**
	 * Constant indicating the area is a panel.
	 */
	public TYPE_PANEL = CustomisableUIAreaType.Panel;

	/**
	 * Constant indicating the context is root.
	 */
	public CONTEXT_ROOT = CustomisableUIContextType.Root;

	/**
	 * Constant indicating the context is a panel.
	 */
	public CONTEXT_PANEL = CustomisableUIContextType.Panel;

	/**
	 * Constant indicating the context is a sidebar.
	 */
	public CONTEXT_SIDEBAR = CustomisableUIContextType.Sidebar;

	/**
	 * Constant indicating the context is a frame.
	 */
	public CONTEXT_FRAME = CustomisableUIContextType.Frame;

	/**
	 * Constant indicating the widget is built-in
	 */
	public SOURCE_BUILTIN = CustomisableUIWidgetSource.BuiltIn;

	/**
	 * Constant indicating the widget is externally provided
	 * (e.g. by add-ons or other items not part of the builtin widget set).
	 */
	public SOURCE_EXTERNAL = CustomisableUIWidgetSource.External;

	/**
	 * A map of all registered widgets in the UI
	 */
	private widgets = new Map<string, Widget>();

	/**
	 * A map of placements in the UI
	 */
	private placements = new Map<string, CustomisableUIPlacement[]>();

	/**
	 * A map of areas defined in the UI
	 */
	private areas = new Map<string, CustomisableUIArea>();

	/**
	 * An mapping of Firefox-only areas for the migration tool
	 */
	private firefoxAreasMapping = {
		/**
		 * Bookmarks bar
		 */
		PersonalToolbar: (placementIds: string[]) => {},
		/**
		 * Tabs bar
		 */
		TabsToolbar: (placementIds: string[]) => {},
		/**
		 * Navigation controls bar (back button, addressbar, etc.)
		 */
		"nav-bar": (placementIds: string[]) => {},
		/**
		 * Menu items bar (on Windows and Linux only)
		 */
		"toolbar-menubar": (placementIds: string[]) => {
			// Do a platform check here to avoid migration on macOS
		},
		/**
		 * Extensions in the extensions popout button
		 */
		"unified-extensions-area": (placementIds: string[]) => {},
		/**
		 * Widgets in the overflow list
		 */
		"widget-overflow-fixed-list": (placementIds: string[]) => {}
	};

	/**
	 * The cached UI state from disk.
	 */
	private savedState!:
		| CustomisableUISerialisedConfiguration
		| Partial<CustomisableUISerialisedConfiguration>;

	/**
	 * Start up CustomisableUI
	 */
	public initialize() {
		console.debug("Initializing...");

		this.defineBuiltInWidgets();
		this.loadSavedState();
		this.migrateToNewVersion();

		// Define the root area
		this.registerArea("root", {
			type: CustomisableUIAreaType.Panel,
			context: CustomisableUIContextType.Root,

			width: "fill-container",
			height: "fill-container",

			visible: true,

			orientation: CustomisableUIAreaOrientation.Vertical
		});
	}

	/**
	 * Perform UI migrations
	 */
	public migrateToNewVersion() {}

	/**
	 * Define the built in widgets used in Dot Browser
	 */
	private defineBuiltInWidgets() {
		for (const widgetDefinition of CustomizableWidgets) {
			this.createBuiltinWidget(widgetDefinition);
		}
	}

	/**
	 * Create a built in widget
	 */
	public createBuiltinWidget(data: Widget) {
		let widget = this.normalizeWidget(data, this.SOURCE_BUILTIN);
		if (!widget) {
			console.error("Error creating builtin widget:", data.id);
			return;
		}

		console.debug("Creating built-in widget with id:", data.id);
		this.widgets.set(widget.id, widget);
	}

	/**
	 * Create a widget
	 */
	public createWidget(data: Widget) {
		let widget = this.normalizeWidget(data, this.SOURCE_EXTERNAL);
		if (!widget) {
			console.error("Error creating widget:", data.id);
			return;
		}

		console.debug("Creating widget with id:", data.id);
		this.widgets.set(widget.id, widget);
	}

	/**
	 * Normalises the widget and cleans up any bad data
	 */
	public normalizeWidget(
		widget: Partial<Widget>,
		source: CustomisableUIWidgetSource
	): Widget | null {
		const widgetKeys = new Set(Object.keys(widget));

		const throwError = (...msg: any[]) => {
			console.error(msg);
			return null;
		};

		if (
			!widgetKeys.has("id") ||
			typeof widget.id != "string" ||
			!/^[a-z0-9-_]{1,}$/i.test(widget.id)
		) {
			return throwError("Given an illegal id in normalizeWidget", widget.id);
		}

		return widget as Required<Widget>;
	}

	/**
	 * Registers a new customisable area
	 */
	public registerArea(id: string, properties: CustomisableUIArea) {
		if (typeof id != "string" || !/^[a-z0-9-_]{1,}$/i.test(id)) {
			console.error("Area has illegal ID of", id);
			return null;
		}

		for (const part of ["root", ...(id.split(".").slice(1) || [])]) {
			// Root doesn't need to be checked as it is guaranteed to exist
			if (part == "root") continue;

			if (!this.areas.has(part)) {
				console.error(`Registered area ${id} tried to be child of unknown area ID ${part}`);
				return null;
			}
		}

		if (this.areas.get(id)) {
			console.error(`Area ${id} already exists.`);
			return null;
		}

		if (id == "root" && properties.context !== CustomisableUIContextType.Root) {
			console.error(`Area ${id} cannot become root.`);
			return null;
		}

		// Check if both width and height are undefined
		if (!properties.width && !properties.height) {
			console.error(
				`Area ${id} needs both a width and height property in order to be registered.`
			);
			return null;
		}

		if (!properties.orientation) {
			properties.orientation = CustomisableUIAreaOrientation.Vertical;
		}

		this.areas.set(id, properties);
		this.placements.set(id, properties.defaultPlacements || []);

		this.saveState();
	}

	/**
	 * Adds a widget to an existing area
	 */
	public addWidgetToArea(
		widgetId: string,
		areaId: string,
		position?: number,
		properties?: CustomisableUIPlacementProperties
	) {
		if (!this.widgets.get(widgetId)) {
			throw new Error("Unknown widget ID " + areaId);
		}

		if (!this.areas.get(areaId) || !this.placements.get(areaId)) {
			throw new Error("Unknown customisation area " + areaId);
		}

		const placements = this.placements.get(areaId) as CustomisableUIPlacement[];

		if (typeof position != "number") position = placements.length;
		if (position < 0) position = 0;

		placements.splice(position, 0, [widgetId, properties || ({} as any)]);

		this.saveState();

		// @todo add event emitters to emit widgetAdded event
	}

	/**
	 * Save the current state to disk
	 */
	public saveState() {
		let state = {
			placements: new Map(this.placements),
			areas: new Map(this.areas),
			seen: new Set(), // This is currently unused in Dot Browser.
			dirtyAreaCache: new Set(), // This is currently unused in Dot Browser.
			currentVersion: this.kVersion,
			newElementCount: 0 // This is currently unused in Dot Browser.
		};

		if (this.savedState && this.savedState.placements) {
			for (let area of Object.keys(this.savedState.placements)) {
				if (!state.placements.has(area)) {
					let placements = this.savedState.placements[area];
					state.placements.set(area, placements);
				}
			}
		}

		// Root takes up unneccessary space in the state
		state.placements.delete("root");
		state.areas.delete("root");

		console.debug("Saving state.");
		const serialized = JSON.stringify(state, this.serializerHelper, 4);
		console.debug("State saved as: " + serialized);

		Services.prefs.setStringPref("browser.uiCustomization.state", serialized);
	}

	/**
	 * Serializes UI state into hygenic JSON
	 */
	public serializerHelper(key: string, value: any) {
		if (typeof value == "object" && value.constructor.name == "Map") {
			let result: any = {};
			for (let [mapKey, mapValue] of value) {
				result[mapKey] = mapValue;
			}
			return result;
		}

		if (typeof value == "object" && value.constructor.name == "Set") {
			return [...value];
		}

		return value;
	}

	/**
	 * Load the saved state from disk
	 */
	public loadSavedState() {
		let state = "";

		try {
			state = Services.prefs.getStringPref("browser.uiCustomization.state");
		} catch (e) {}

		if (!state) return;

		try {
			this.savedState = JSON.parse(state);

			if (typeof this.savedState != "object" || this.savedState === null) {
				throw new Error("Invalid saved state");
			}
		} catch (e) {
			/* @todo: in final version this should be a clearPreference call */
			Services.prefs.setStringPref("browser.uiCustomization.state", "");

			this.savedState = {};
			console.debug("Error loading saved UI customization state, falling back to defaults.");

			/* @todo: create a default layout */
		}

		if (!("placements" in this.savedState)) {
			this.savedState.placements = {};
		}

		if (!("areas" in this.savedState)) {
			this.savedState.areas = {};
		}

		if (!("currentVersion" in this.savedState)) {
			this.savedState.currentVersion = 0;
		}

		for (const [id, placements] of Object.entries(
			this.savedState.placements as CustomisableUISerialisedConfiguration["placements"]
		)) {
			if (!this.areas.get(id)) {
				this.areas.delete(id);
				this.placements.delete(id);

				console.debug("Error locating saved area with ID", id);

				this.saveState();
				return null;
			}

			for (const placement of placements) {
				console.log(placement);
			}
		}
	}
}

class _CustomisableUI {
	private internal = new _CustomisableUIInternal();

	public constructor() {
		this.internal.initialize();
	}

	public registerArea(id: string, properties: CustomisableUIArea) {
		return this.internal.registerArea(id, properties);
	}

	public addWidgetToArea(widgetId: string, areaId: string, position?: number) {
		return this.internal.addWidgetToArea(widgetId, areaId, position);
	}
}

export const CustomisableUI = new _CustomisableUI();
