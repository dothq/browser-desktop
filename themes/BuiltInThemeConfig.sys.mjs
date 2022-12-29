/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// List of themes built in to the browser. The themes are represented by objects
// containing their id, current version, and path relative to
// resource://builtin-themes/.
export const BuiltInThemeConfig = new Map([
	[
		"dot-compact-light@mozilla.org",
		{
			version: "1.0",
			path: "resource://builtin-themes/light/"
		}
	],
	[
		"dot-compact-dark@mozilla.org",
		{
			version: "1.0",
			path: "resource://builtin-themes/dark/"
		}
	]
]);
