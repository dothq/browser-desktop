/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants } from "../../third_party/dothq/gecko-types/lib/AppConstants.js";
import {
	Area,
	CustomizableUIArea,
	CustomizableUIAreaOrientation,
	CustomizableUIAreaType,
	CustomizableUIContextType
} from "./CustomizableUIArea.js";
import { CustomizableUISerialisedConfiguration } from "./CustomizableUIConfig.js";
import {
	CustomizableUIPlacement,
	CustomizableUIPlacementProperties
} from "./CustomizableUIPlacement.js";
import { CustomizableUIWidgetSource } from "./CustomizableUIWidgets.js";
import Widget from "./widgets/common/index.js";
import { CustomizableWidgets } from "./widgets/index.js";

const { AppConstants } = ChromeUtils.importESModule<AppConstants>(
	"resource://gre/modules/AppConstants.sys.mjs"
);

const { EventEmitter } = ChromeUtils.importESModule<any>(
	"resource://gre/modules/EventEmitter.sys.mjs"
);

export interface CustomizableUIBaseEntity {
	/**
	 * Determines whether the entity should be visible
	 */
	visible: boolean;
}

class _CustomizableUI {
	/**
	 * The current version. We can use this to auto-add new default widgets as necessary.
	 */
	private kVersion = 0;

	/**
	 * Constant indicating the area is a panel.
	 */
	public TYPE_PANEL = CustomizableUIAreaType.Panel;

	/**
	 * Constant indicating the context is root.
	 */
	public CONTEXT_ROOT = CustomizableUIContextType.Root;

	/**
	 * Constant indicating the context is a panel.
	 */
	public CONTEXT_PANEL = CustomizableUIContextType.Panel;

	/**
	 * Constant indicating the context is a sidebar.
	 */
	public CONTEXT_SIDEBAR = CustomizableUIContextType.Sidebar;

	/**
	 * Constant indicating the context is a frame.
	 */
	public CONTEXT_FRAME = CustomizableUIContextType.Frame;

	/**
	 * Constant indicating the widget is built-in
	 */
	public SOURCE_BUILTIN = CustomizableUIWidgetSource.BuiltIn;

	/**
	 * Constant indicating the widget is externally provided
	 * (e.g. by add-ons or other items not part of the builtin widget set).
	 */
	public SOURCE_EXTERNAL = CustomizableUIWidgetSource.External;

	/**
	 * A map of all registered widgets in the UI
	 */
	private widgetsElMap = new Map<string, Widget>();

	/**
	 * A map of all registered areas in the UI
	 */
	private areasElMap = new Map<string, Area>();

	/**
	 * A map of placements in the UI
	 */
	private placements = new Map<string, CustomizableUIPlacement[]>();

	/**
	 * A map of areas defined in the UI
	 */
	private areas = new Map<string, CustomizableUIArea>();

	/**
	 * An array of Firefox-only areas for the migration tool
	 */
	private firefoxAreasMapping: string[] = [
		/**
		 * Bookmarks bar
		 */
		"PersonalToolbar",
		/**
		 * Tabs bar
		 */
		"TabsToolbar",
		/**
		 * Navigation controls bar (back button, addressbar, etc.)
		 */
		"nav-bar",
		/**
		 * Extensions in the extensions popout button
		 */
		"unified-extensions-area",
		/**
		 * Widgets in the overflow list
		 */
		"widget-overflow-fixed-list"
	].concat(
		AppConstants.platform != "macosx"
			? [
					/**
					 * Menu items bar (on Windows and Linux only)
					 */
					"toolbar-menubar"
			  ]
			: []
	);

	private firefoxWidgetsMapping: Record<string, () => Widget> = {
		"back-button": () => {
			return this.widgetsElMap.get("back-button");
		}
	};

	/**
	 * The cached UI state from disk.
	 */
	private savedState!:
		| CustomizableUISerialisedConfiguration
		| Partial<CustomizableUISerialisedConfiguration>;

	/**
	 * CustomizableUI mount element
	 */
	public get mountEl() {
		return document.getElementById("mount");
	}

	/**
	 * Start up CustomizableUI
	 */
	public initialize() {
		console.debug("Initializing...");

		this.loadSavedState();
		this.defineBuiltInWidgets();
		this.migrateToNewVersion();

		// Define the root area
		this.registerArea("root", {
			type: CustomizableUIAreaType.Panel,
			context: CustomizableUIContextType.Root,

			width: "fill-container",
			height: "fill-container",

			visible: true,

			orientation: CustomizableUIAreaOrientation.Vertical
		});

		// Define the browser area
		this.registerArea("browser", {
			type: CustomizableUIAreaType.Panel,
			context: CustomizableUIContextType.Frame,

			width: "fill-container",
			height: "fill-container",

			visible: true,

			orientation: CustomizableUIAreaOrientation.Horizontal,

			defaultPlacements: [["browser-frame"]]
		});

		// We hydrate the state after registering the
		// default areas to ensure there aren't any DOM errors
		this.hydrateSavedState();
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
			console.log(widgetDefinition);

			this.createBuiltinWidget(widgetDefinition);
		}
	}

	/**
	 * Create a built in widget
	 */
	public createBuiltinWidget(data: Widget) {
		let widget = this.normalizeWidget(data, this.SOURCE_BUILTIN);
		if (!widget) {
			console.error("Error creating built-in widget:", data.id);
			return;
		}

		console.debug("Creating built-in widget with id:", data.id);
		this.widgetsElMap.set(widget.id, widget);
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
		this.widgetsElMap.set(widget.id, widget);
	}

	/**
	 * Normalises the widget and cleans up any bad data
	 */
	public normalizeWidget(
		widget: Partial<Widget>,
		source: CustomizableUIWidgetSource
	): Widget | null {
		const throwError = (...msg: any[]) => {
			console.error(...msg);
			return null;
		};

		if (!widget.id || typeof widget.id != "string" || !/^[a-z0-9-_]{1,}$/i.test(widget.id)) {
			return throwError("Given an illegal id in normalizeWidget", widget.id);
		}

		return widget as Required<Widget>;
	}

	/**
	 * Registers a new customisable area
	 */
	public registerArea(id: string, properties: Omit<CustomizableUIArea, "id">) {
		if (typeof id != "string" || !/^[a-z0-9-_]{1,}$/i.test(id)) {
			console.error("Area has illegal ID of", id);
			return null;
		}

		if ((properties as any).id) {
			console.error("id property in area cannot be manually changed.");
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

		if (id == "root" && properties.context !== CustomizableUIContextType.Root) {
			console.error(`Area ${id} cannot become root.`);
			return null;
		}

		// Check if type is not set
		if (!properties.type || !Object.values(CustomizableUIAreaType).includes(properties.type)) {
			console.error(
				`Area ${id} got illegal type property. Type: ${
					properties.type
				}. Allowed values: ${Object.values(CustomizableUIAreaType)}`
			);
			return null;
		}

		// Check if context is not set
		if (
			!properties.context ||
			!Object.values(CustomizableUIContextType).includes(properties.context)
		) {
			console.error(
				`Area ${id} got illegal context property. Context: ${
					properties.context
				}. Allowed values: ${Object.values(CustomizableUIContextType)}`
			);
			return null;
		}

		// Check if both width and height are undefined
		if (!properties.width && !properties.height) {
			console.error(
				`Area ${id} needs both a width and height property in order to be registered.`
			);
			return null;
		}

		const allowedBoundValues = ["fill-container", "hug-contents"];

		if (typeof properties.width == "string") {
			if (!allowedBoundValues.includes(properties.width)) {
				console.error(
					`Area ${id} took an illegal value for width. Width: ${properties.width}. Allowed values: ${allowedBoundValues}`
				);
				return null;
			}
		} else if (typeof properties.width == "number") {
			if (!Number.isFinite(properties.width) || properties.width < 0) {
				console.error(
					`Area ${id} took an illegal value for width. Width: ${properties.width}.`
				);
				return null;
			}
		}

		if (typeof properties.height == "string") {
			if (!allowedBoundValues.includes(properties.height)) {
				console.error(
					`Area ${id} took an illegal value for height. Height: ${properties.height}. Allowed values: ${allowedBoundValues}`
				);
				return null;
			}
		} else if (typeof properties.height == "number") {
			if (!Number.isFinite(properties.height) || properties.height < 0) {
				console.error(
					`Area ${id} took an illegal value for height. Height: ${properties.height}.`
				);
				return null;
			}
		}

		if (!properties.orientation) {
			properties.orientation = CustomizableUIAreaOrientation.Vertical;
		}

		(properties as CustomizableUIArea).id = id;

		this.areas.set(id, properties as CustomizableUIArea);
		this.placements.set(
			id,
			properties.defaultPlacements || this.savedState.placements[id] || []
		);

		console.log(properties);

		this.areasElMap.set(id, new Area(properties));

		this.renderArea(id, id == "root" ? this.mountEl : this.areasElMap.get("root"));

		this.saveState();
	}

	/**
	 * Updates and existing areas' properties
	 */
	public updateArea(id: string, partialProperties: Partial<CustomizableUIArea>) {
		const properties = { ...this.areas.get(id), ...partialProperties };

		this.areas.set(id, properties);

		const areaComponent = this.areasElMap.get(id);
		areaComponent.recalculateProps(partialProperties);

		this.saveState();
	}

	/**
	 * Removes an existing area
	 */
	public removeArea(id: string) {
		this.areas.delete(id);
		this.placements.delete(id);
		this.areasElMap.delete(id);

		document.querySelector(`area-panel#area-${id}`).remove();

		this.saveState();
	}

	/**
	 * Renders an area to the DOM
	 */
	public renderArea(id: string, parentNode: HTMLElement) {
		if (!this.areas.has(id)) {
			console.error(`Area ${id} does not exist.`);
		}

		console.debug(`Rendering area ${id}...`);

		const node = this.areasElMap.get(id);
		const index =
			id == "root" ? 0 : Array.from(this.areasElMap.keys()).findIndex((i) => i == id);

		console.debug(node, parentNode);

		this.insertElementAtIndex(node, index, parentNode);
	}

	/**
	 * Renders all areas to the DOM
	 * Should only be called at init
	 * Use renderArea for runtime rendering
	 */
	public renderAreas() {
		for (const [areaID] of this.placements) {
			if (areaID == "root") continue;

			this.renderArea(areaID, this.areasElMap.get("root"));
		}
	}

	/**
	 * Inserts element at a specified index
	 */
	public insertElementAtIndex(element: Element, index: number, parentNode: ParentNode) {
		// Get just the elements, no textnodes
		const elements = Array.from(parentNode.childNodes).filter(
			(el) => el.nodeType == 1
		) as HTMLElement[];

		if (elements.length == 0) {
			// Parent node is empty, so we just append it to the nodes
			return parentNode.appendChild(element);
		} else if (index >= elements.length) {
			// Insert after last element
			const lastEl = elements[elements.length - 1];

			return lastEl.insertAdjacentElement("afterend", element);
		} else if (index <= elements.length) {
			// Insert before first element
			const firstEl = elements[0];

			return firstEl.insertAdjacentElement("beforebegin", element);
		} else {
			// Insert before element
			const insertBeforeEl = elements[index];

			return insertBeforeEl.insertAdjacentElement("beforebegin", element);
		}
	}

	/**
	 * Adds a widget to an existing area
	 */
	public addWidgetToArea(
		widgetId: string,
		areaId: string,
		position?: number,
		properties?: CustomizableUIPlacementProperties
	) {
		if (!this.widgetsElMap.get(widgetId)) {
			throw new Error("Unknown widget ID " + areaId);
		}

		if (!this.areas.get(areaId) || !this.placements.get(areaId)) {
			throw new Error("Unknown customisation area " + areaId);
		}

		const placements = this.placements.get(areaId) as CustomizableUIPlacement[];

		if (typeof position != "number") position = placements.length;
		if (position < 0) position = 0;

		placements.splice(position, 0, [widgetId, properties || ({} as any)]);

		this.saveState();

		// @todo add event emitters to emit widgetAdded event
	}

	/**
	 * Get placements for area ID
	 */
	public getPlacementsByAreaID(id: string) {
		return this.placements.get(id);
	}

	/**
	 * Get widget element for widget ID
	 */
	public getWidgetElementById(id: string) {
		return this.widgetsElMap.get(id);
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

		if (this.savedState) {
			if (this.savedState.placements) {
				for (let area of Object.keys(this.savedState.placements)) {
					if (!state.placements.has(area)) {
						let placements = this.savedState.placements[area];

						state.placements.set(area, placements);
					}
				}
			}
		}

		// Root takes up unneccessary space in the state
		state.placements.delete("root");
		state.areas.delete("root");

		// Remove browser's area data as this is defined programatically
		state.areas.delete("browser");

		// Exclude ID from saved data
		state.areas.forEach((area, index) => {
			const data: any = {};

			for (const [key, value] of Object.entries(area)) {
				if (key == "id") continue;

				data[key] = value;
			}

			state.areas.set(index, data);
		});

		// Remove any items from placements that don't have an item in areas
		state.placements.forEach((_, id) => {
			// These are defined programatically and thus have area data
			if (id == "root" || id == "browser") return;

			if (!state.areas.has(id)) {
				state.placements.delete(id);
			}
		});

		console.debug("Saving state.");
		const serialized = JSON.stringify(state, this.serializerHelper, 4);
		console.debug("State saved as: " + serialized);

		Services.prefs.setStringPref("dot.uiCustomization.state", serialized);
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
			state = Services.prefs.getStringPref("dot.uiCustomization.state");
		} catch (e) {}

		// We don't have a value yet.
		if (!state || !state.length) {
			this.saveState();
			return this.loadSavedState();
		}

		console.debug("Loading saved CustomizableUI state.");

		try {
			this.savedState = JSON.parse(state);

			if (typeof this.savedState != "object" || this.savedState === null) {
				throw new Error("Invalid saved state");
			}
		} catch (e) {
			/* @todo: in final version this should be a clearPreference call */
			Services.prefs.setStringPref("dot.uiCustomization.state", "");

			this.savedState = {};
			console.debug("Error loading saved UI customization state, falling back to defaults.");

			/* @todo: create a default layout */
		}

		console.debug("Loaded state.", this.savedState);

		if (!("placements" in this.savedState)) {
			this.savedState.placements = {};
		}

		if (!("areas" in this.savedState)) {
			this.savedState.areas = {};
		}

		if (!("currentVersion" in this.savedState)) {
			this.savedState.currentVersion = 0;
		}

		for (const [areaId, placements] of Object.entries(this.savedState.placements)) {
			console.log("AT LOAD", areaId, placements);

			this.placements.set(areaId, placements);
		}
	}

	public hydrateSavedState() {
		for (const [id, properties] of Object.entries(this.savedState.areas)) {
			if (this.areas.has(id)) {
				this.updateArea(id, properties);
			} else {
				this.registerArea(id, properties);
			}
		}

		// todo: add a way to actually load the placemnets

		for (const [id, placements] of Object.entries(
			this.savedState.placements as CustomizableUISerialisedConfiguration["placements"]
		)) {
			if (this.areas.get(id) || this.firefoxAreasMapping.includes(id)) {
				let i = 0;

				for (const placement of placements) {
					if (typeof placement == "string") {
						this.savedState.placements[id][i] = [placement];
					}

					i++;
				}
			} else {
				this.areas.delete(id);
				this.placements.delete(id);

				console.debug("Error locating saved area with ID", id);

				this.saveState();
				return null;
			}
		}
	}
}

export const DotCustomizableUI = new _CustomizableUI();
// window.DotCustomizableUI = DotCustomizableUI;
