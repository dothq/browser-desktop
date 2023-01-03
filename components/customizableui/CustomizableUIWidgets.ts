/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum CustomizableUIWidgetDisplay {
	Icons = "icons",
	Text = "text",
	IconsAndText = "icons_and_text",
	IconsBesideText = "icons_beside_text"
}

export enum CustomizableUIWidgetSource {
	BuiltIn = "builtin",
	External = "external"
}

export type CustomizableUIWidgetConfigurationTypes = "string" | "boolean" | "number";
