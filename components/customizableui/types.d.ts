/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface CustomizableConfig extends CustomizableAreaStack {
	version: number;
}

export type CustomizableAreaType = string;
export type CustomizableAreaOrientation = string;
export type CustomizableAreaMode = string;

export type CustomizableAreas = Record<
	CustomizableAreaWidgetReference,
	CustomizableArea
>;

export type CustomizableArea = CustomizableAreaStack | CustomizableAreaToolbar | CustomizableAreaSidebar | CustomizableAreaAddressbar | CustomizableAreaTab;

export interface CustomizableAreaBase {
	type: CustomizableAreaType;
	with?: {
		orientation?: CustomizableAreaOrientation;
		layout?: CustomizableLayout;
		components?: CustomizableAreas;
		mode?: CustomizableAreaMode;
	}
}

export interface CustomizableAreaStack extends CustomizableAreaBase {
	type: "stack";
}

export interface CustomizableAreaToolbar extends CustomizableAreaBase {
	type: "toolbar";
}

export interface CustomizableAreaSidebar extends CustomizableAreaBase {
	type: "sidebar";
	with?: {
		type?: "drawer";
	} & CustomizableAreaBase["with"];
}

export interface CustomizableAreaAddressbar extends CustomizableAreaBase {
	type: "addressbar";
}

export interface CustomizableAreaTab extends CustomizableAreaBase {
	type: "tab";
    with?: {
		hideActions?: boolean;
	} & CustomizableAreaBase["with"];
}

export type CustomizableAreaWidgetReference = `@${string}` | string;

export type CustomizableAreaWidgetOptions = Record<string, any>;
export type CustomizableAreaWidget =
	| CustomizableAreaWidgetReference
	| [CustomizableAreaWidgetReference]
	| [CustomizableAreaWidgetReference, CustomizableAreaWidgetOptions];

export type CustomizableLayout = CustomizableAreaWidget[];

// const config: CustomizableConfig = {
//     	version: 1,
//     	type: "stack",
//     	with: {}
// };

// const config: CustomizableConfig = {
// 	version: 1,
// 	type: "stack",
// 	with: {
// 		layout: ["@chrome", "@chrome", "@chrome"],
// 		orientation: "vertical",
// 		areas: {
// 			"@chrome": {
// 				type: "stack",
// 				with: {
// 					layout: ["@toolbars", "@web-contents"],
// 					orientation: "horizontal"
// 				},
// 			},

// 			"@toolbars": {
// 				type: "stack",
// 				with: {
// 					layout: ["@menubar", "@toolbar", "@navbar"],
// 					orientation: "horizontal"
// 				}
// 			},
// 			"@menubar": {
// 				type: "toolbar",
// 				with: {
// 					mode: "text",
// 					layout: [
// 						[
// 							"ToolbarButtton",
// 							{
// 								is: "main-menu-button",
// 								icon: "brand32",
// 								mode: "icons"
// 							}
// 						],
// 						["ToolbarButton", { is: "file-menu-button" }],
// 						["ToolbarButton", { is: "edit-menu-button" }],
// 						["ToolbarButton", { is: "view-menu-button" }],
// 						["ToolbarButton", { is: "history-menu-button" }],
// 						["ToolbarButton", { is: "bookmarks-menu-button" }],
// 						["ToolbarButton", { is: "tools-menu-button" }],
// 						["ToolbarButton", { is: "help-menu-button" }]
// 					]
// 				}
// 			},
// 			"@toolbar": {
// 				type: "toolbar",
// 				with: {
// 					mode: "icons",
// 					layout: [
// 						["FlexibleSpring", { width: 42 }],
// 						"@tab-strip",
// 						["ToolbarButton", { is: "add-tab-button" }],
// 						["FlexibleSpring"],
// 						["ToolbarButton", { is: "list-tabs-button" }]
// 					]
// 				}
// 			},
// 			"@navbar": {
// 				type: "toolbar",
// 				with: {
// 					mode: "icons",
// 					layout: [
// 						["ToolbarButton", { is: "back-button" }],
// 						["ToolbarButton", { is: "forward-button" }],
// 						["ToolbarButton", { is: "reload-button" }],
// 						["FlexibleSpring"],
// 						"@addressbar",
// 						["FlexibleSpring"],
// 						["ToolbarButton", { is: "downloads-button" }],
// 						["ToolbarButton", { is: "profile-button" }],
// 						"@extensions-strip",
// 						["ToolbarButton", { is: "main-menu-button" }]
// 					]
// 				}
// 			},
// 			"@personalbar": {
// 				type: "toolbar",
// 				with: {
// 					mode: "icons",
// 					layout: ["@bookmarks-strip"]
// 				}
// 			},

// 			"@tab-strip": {
// 				type: "stack",
// 				with: {
// 					mode: "icons",
// 					layout: [["TabStrip", { layout: ["@tab"] }]],
// 					orientation: "horizontal"
// 				}
// 			},
// 			"@tab": {
// 				type: "tab",
// 				with: {
// 					mode: "icons",
// 					layout: [
// 						["TabIcon"],
// 						["TabLabel"],
// 						["ToolbarButton", { is: "close-tab-button" }]
// 					]
// 				}
// 			},

// 			"@addressbar": {
// 				type: "stack",
// 				with: {
// 					mode: "icons",
// 					layout: [
// 						["ToolbarButton", { is: "shield-button" }],
// 						["ToolbarButton", { is: "identity-button" }],
// 						["AddressbarInput"],
// 						["ExtensionsStrip", { type: "page_action" }],
// 						["ToolbarButton", { is: "bookmark-page-button" }]
// 					],
// 					orientation: "horizontal"
// 				}
// 			},

// 			"@extensions-strip": {
// 				type: "stack",
// 				with: {
// 					mode: "icons",
// 					layout: [
// 						[
// 							"ExtensionsStrip",
// 							{
// 								type: "browser_action",
// 								filter: "ext.badgeCount >= 1",
// 								overflow_rest: true
// 							}
// 						]
// 					],
// 					orientation: "horizontal"
// 				}
// 			},

// 			"@bookmarks-strip": {
// 				type: "stack",
// 				with: {
// 					mode: "icons",
// 					layout: [
// 						[
// 							"ToolbarButton",
// 							{
// 								is: "places-button",
// 								filter: "entry.type == 'bookmarks' && entry.id == 'f39flhbag96'"
// 							}
// 						],
// 						["PlacesStrip", { type: "bookmarks" }]
// 					],
// 					orientation: "horizontal"
// 				}
// 			},

// 			"@web-contents": {
// 				type: "stack",
// 				with: {
// 					layout: [
// 						"@web-contents-sidebar",
// 						["WebContents", { flex: 1 }]
// 					],
// 					orientation: "vertical"
// 				}
// 			},

// 			"@web-contents-sidebar": {
// 				type: "sidebar",
// 				with: {
// 					mode: "icons",
// 					type: "drawer",
// 					layout: [
// 						[
// 							"ToolbarButton",
// 							{
// 								is: "places-button",
// 								filter: "entry.type == 'bookmarks'"
// 							}
// 						],
// 						[
// 							"ToolbarButton",
// 							{
// 								is: "places-button",
// 								filter: "entry.type == 'history'"
// 							}
// 						],
// 						["ToolbarButton", { is: "downloads-button" }],
// 						["Divider"],
// 						[
// 							"ToolbarButton",
// 							{
// 								is: "places-button",
// 								filter: "entry.type == 'saved_site' && entry.url == 'https://app.element.io'"
// 							}
// 						],
// 						[
// 							"ToolbarButton",
// 							{
// 								is: "places-button",
// 								filter: "entry.type == 'saved_site' && entry.url == 'https://web.whatsapp.com'"
// 							}
// 						],
// 						[
// 							"ToolbarButton",
// 							{
// 								is: "places-button",
// 								filter: "entry.type == 'saved_site' && entry.url == 'https://discord.com/app'"
// 							}
// 						],
// 						[
// 							"ToolbarButton",
// 							{
// 								is: "places-button",
// 								filter: "entry.type == 'saved_site' && entry.url == 'https://en.wikipedia.org/wiki/Main_Page'"
// 							}
// 						],
// 						["FlexibleSpring"],
// 						["ToolbarButton", { is: "profile-button" }],
// 						["ToolbarButton", { is: "settings-button" }],
// 						["ToolbarButton", { is: "collapse-button" }]
// 					],
// 					orientation: "vertical"
// 				}
// 			}
// 		}
// 	}
// };
