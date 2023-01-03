/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomizableUIPlacement } from "./CustomizableUIPlacement.js";

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
