/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { logger } from "./CustomizableUI";
import { CustomizableUIComponentBase } from "./CustomizableUIComponent";
import { CustomizableUIPlacement } from "./CustomizableUIPlacement";
import { insertElementAtIndex } from "./CustomizableUIUtils";

export enum CustomizableUIAreaType {
	Panel = "panel"
}

export enum CustomizableUIContextType {
	Root = "root",
	Panel = "panel",
	Sidebar = "sidebar",
	Frame = "frame"
}

export type CustomizableUIAreaBound = "fill-container" | "hug-contents" | number;

export enum CustomizableUIAreaOrientation {
	Horizontal = "horizontal",
	Vertical = "vertical"
}

export interface CustomizableUIAreaDoWhenConditions {
	/**
	 * Determines what keybind will need to be pressed to do something to the area
	 */
	keybind?: string;
}
export type CustomizableUIAreaDoWhen = [string | string[], CustomizableUIAreaDoWhenConditions];

export interface CustomizableUIArea {
	/**
	 * The ID of the area
	 */
	id: string;

	/**
	 * Type of area to create
	 */
	type: CustomizableUIAreaType;

	/**
	 * The context of the area tells the browser how it should be contextualised
	 */
	context: CustomizableUIContextType;

	/**
	 * Width of the area
	 */
	width?: CustomizableUIAreaBound;

	/**
	 * Height of the area
	 */
	height?: CustomizableUIAreaBound;

	/**
	 * Orientation of the area
	 */
	orientation?: CustomizableUIAreaOrientation;

	/**
	 * Determines whether the area should be visible
	 */
	visible?: boolean;

	/**
	 * Determines which events will need to be fired to toggle the visibility
	 */
	visible_when?: CustomizableUIAreaDoWhen;

	/**
	 * An array of default placements to add to the area
	 */
	defaultPlacements?: CustomizableUIPlacement[];
}

export class Area extends CustomizableUIComponentBase<CustomizableUIArea> {
	public areaId!: string;

	/**
	 * Gets the area ID
	 */
	public get id() {
		return super.id;
	}

	/**
	 * Updates the area id
	 */
	public set id(newValue: string) {
		this.areaId = newValue;
		super.id = `area-${newValue}`;
	}

	/**
	 * Gets the type of area to create
	 */
	public get type() {
		return this.getAttribute("type") as CustomizableUIAreaType;
	}

	/**
	 * Updates the type of area
	 */
	public set type(newValue: CustomizableUIAreaType) {
		this.setAttribute("type", newValue);
	}

	/**
	 * The context of the area tells the browser how it should be contextualised
	 */
	public get context() {
		return this.getAttribute("context") as CustomizableUIContextType;
	}

	/**
	 * Updates the context of the area
	 */
	public set context(newValue: CustomizableUIContextType) {
		this.setAttribute("context", newValue);
	}

	public get width() {
		const value = this.style.getPropertyValue("--width") as CSSStyleDeclaration["width"];

		if (value == "min-width") {
			return "hug-contents";
		} else if (value == "100%") {
			return "fill-container";
		} else {
			return parseInt(value);
		}
	}

	public set width(newValue: CustomizableUIAreaBound) {
		let w = newValue as CSSStyleDeclaration["width"];

		if (newValue == "hug-contents") {
			w = "min-width";
		} else if (newValue == "fill-container") {
			w = "100%";
		} else {
			w = `${parseInt(w)}px`;
		}

		this.style.setProperty("--width", w);
	}

	public get height() {
		const value = this.style.getPropertyValue("--height") as CSSStyleDeclaration["height"];

		if (value == "min-height") {
			return "hug-contents";
		} else if (value == "100%") {
			return "fill-container";
		} else {
			return parseInt(value);
		}
	}

	public set height(newValue: CustomizableUIAreaBound) {
		let h = newValue as CSSStyleDeclaration["height"];

		if (newValue == "hug-contents") {
			h = "min-height";
		} else if (newValue == "fill-container") {
			h = "100%";
		} else {
			h = `${parseInt(h)}px`;
		}

		this.style.setProperty("--height", h);
	}

	/**
	 * Gets the orientation of the area
	 */
	public get orientation() {
		return this.getAttribute("orientation") as CustomizableUIAreaOrientation;
	}

	/**
	 * Updates the orientation of the area
	 */
	public set orientation(newValue: CustomizableUIAreaOrientation) {
		this.setAttribute("orientation", newValue);
	}

	/**
	 * Gets the visibility of the area
	 */
	public get visible() {
		return !!this.getAttribute("visible");
	}

	/**
	 * Updates the visibility of the area
	 */
	public set visible(newValue: boolean) {
		this.setAttribute("visible", newValue.toString());
	}

	public render() {
		const placements = this._cui.getPlacementsByAreaID(this.areaId);

		const children = [];

		logger.debug(`Rendering widgets inside ${this.areaId}.`);

		if (placements && placements.length) {
			for (const [placementID, placementProperties] of placements) {
				logger.debug(placementID, placementProperties);

				const widgetEl = this._cui.getWidgetElementById(placementID);

				if (placementProperties) widgetEl.configure(placementProperties);

				children.push(widgetEl);
			}
		}

		return html("fragment", {}, ...children);
	}

	public internalRender(markup: HTMLElement) {
		// Removes all nodes that exist in Area but
		// no longer exist in freshly rendered Area
		this.childNodes.forEach((node) => {
			if (!markup.contains(node)) {
				this.removeChild(node);
			}
		});

		// Adds all nodes that exist in freshly rendered
		// Area but don't in Area
		markup.childNodes.forEach((node, index) => {
			// 0     1      **2      3
			// back  back   reload   forward
			if (!this.contains(node)) {
				insertElementAtIndex(node as HTMLElement, index, this);
			}
		});
	}
}

customElements.define("area-panel", Area);
