/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Modules registry used to define the origin file for typing modules imported using Cu.
 */
const registry = {
	AccentColorManager: "themes/AccentColorManager.sys.mjs",
	AccessibilityFocus: "modules/AccessibilityFocus.sys.mjs",

	DotWindowTracker: "modules/DotWindowTracker.sys.mjs",

	DOMUtils: "modules/DOMUtils.sys.mjs",

	Action: "components/actions/Action.sys.mjs",
	ActionRegistry: "components/actions/ActionRegistry.sys.mjs",
	ActionsDispatcher: "components/actions/ActionsDispatcher.sys.mjs",
	ActionsIPC: "components/actions/ActionsIPC.sys.mjs",
	ActionsMessenger: "components/actions/ActionsMessenger.sys.mjs",
	ActionsReceiver: "components/actions/ActionsReceiver.sys.mjs",
	BrowserActions: "components/actions/BrowserActions.sys.mjs",

	BrowserAccessibility:
		"components/accessibility/BrowserAccessibility.sys.mjs",

	BrowserCommands: "components/commands/BrowserCommands.sys.mjs",
	Command: "components/commands/Command.sys.mjs",
	CommandAudiences: "components/commands/CommandAudiences.sys.mjs",
	CommandSubscription: "components/commands/CommandSubscription.sys.mjs",
	GeckoCommand: "components/commands/GeckoCommand.sys.mjs",
	TabCommand: "components/commands/TabCommand.sys.mjs",

	BrowserCompatibility: "components/compat/BrowserCompatibility.sys.mjs",

	BrowserCustomizable:
		"components/customizableui/BrowserCustomizable.sys.mjs",
	BrowserCustomizableAttributePrimitives:
		"components/customizableui/BrowserCustomizableAttributePrimitives.sys.mjs",
	BrowserCustomizableAttributes:
		"components/customizableui/BrowserCustomizableAttributes.sys.mjs",
	BrowserCustomizableComponents:
		"components/customizableui/BrowserCustomizableComponents.sys.mjs",
	BrowserCustomizableInternal:
		"components/customizableui/BrowserCustomizableInternal.sys.mjs",
	BrowserCustomizableShared:
		"components/customizableui/BrowserCustomizableShared.sys.mjs",

	TabDevTools: "components/devtools/TabDevTools.sys.mjs",

	FaviconsDatastore: "components/favicons/FaviconsDatastore.sys.mjs",

	BrowserTabs: "components/tabs/BrowserTabs.sys.mjs",
	BrowserTabsUtils: "components/tabs/BrowserTabsUtils.sys.mjs",

	BrowserMenu: "components/menus/BrowserMenu.sys.mjs",
	BrowserMenuItem: "components/menus/BrowserMenuItem.sys.mjs",
	BrowserMenuItemGroup: "components/menus/BrowserMenuItemGroup.sys.mjs",

	BrowserPanels: "components/panels/BrowserPanels.sys.mjs",

	BrowserPrompts: "components/prompts/BrowserPrompts.sys.mjs",

	BrowserSearch: "components/search/BrowserSearch.sys.mjs",

	BrowserShortcuts: "components/shortcuts/BrowserShortcuts.sys.mjs",

	BrowserStorage: "components/storage/BrowserStorage.sys.mjs",
	Datastore: "components/storage/Datastore.sys.mjs",

	NativeTitlebar: "components/csd/NativeTitlebar.sys.mjs",

	NavigationHelper: "components/navigation/NavigationHelper.sys.mjs",

	StartPage: "components/startpage/StartPage.sys.mjs",

	TabIdentityHandler: "components/identity/TabIdentityHandler.sys.mjs",
	TabProgressListener: "components/tabs/TabProgressListener.sys.mjs",

	ThemeIcons: "themes/ThemeIcons.sys.mjs"
};

export default registry;
