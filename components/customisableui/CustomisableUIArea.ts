/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomisableUIPlacement } from "./CustomisableUIPlacement.js";

export enum CustomisableUIAreaType {
	Panel = "panel"
}

export enum CustomisableUIContextType {
	Root = "root",
	Panel = "panel",
	Sidebar = "sidebar",
	Frame = "frame"
}

export type CustomisableUIAreaBound = "fill-container" | "hug-contents" | number;

export enum CustomisableUIAreaOrientation {
	Horizontal = "horizontal",
	Vertical = "vertical"
}

export interface CustomisableUIAreaDoWhenConditions {
	/**
	 * Determines what keybind will need to be pressed to do something to the area
	 */
	keybind?: string;
}
export type CustomisableUIAreaDoWhen = [string | string[], CustomisableUIAreaDoWhenConditions];

export interface CustomisableUIArea {
	/**
	 * Type of area to create
	 */
	type: CustomisableUIAreaType;

	/**
	 * The context of the area tells the browser how it should be contextualised
	 */
	context: CustomisableUIContextType;

	/**
	 * Width of the area
	 */
	width?: CustomisableUIAreaBound;

	/**
	 * Height of the area
	 */
	height?: CustomisableUIAreaBound;

	/**
	 * Orientation of the area
	 */
	orientation?: CustomisableUIAreaOrientation;

	/**
	 * Determines whether the area should be visible
	 */
	visible?: boolean;

	/**
	 * Determines which events will need to be fired to toggle the visibility
	 */
	visible_when?: CustomisableUIAreaDoWhen;

	/**
	 * An array of default placements to add to the area
	 */
	defaultPlacements?: CustomisableUIPlacement[];
}
