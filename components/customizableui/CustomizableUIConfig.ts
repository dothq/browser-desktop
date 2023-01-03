/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CustomizableUIArea } from "./CustomizableUIArea.js";
import { CustomizableUIPlacement } from "./CustomizableUIPlacement.js";

export interface CustomizableUISerialisedConfiguration {
	placements: Record<string, CustomizableUIPlacement[]>;
	areas: Record<string, CustomizableUIArea>;
	seen: {}; // This is currently unused in Dot Browser.
	dirtyAreaCache: {}; // This is currently unused in Dot Browser.
	currentVersion: number;
	newElementCount: number; // This is currently unused in Dot Browser.
}
