import { nsIXULBrowserWindow } from "./base/content/browser-window";
import { CustomizableUI } from "./components/customizableui/CustomizableUI";
import "./third_party/dothq/gecko-types";
import * as Gecko from "./third_party/dothq/gecko-types/lib";

declare module "resource://app/modules/DevToolsServer.sys.mjs" {}

declare global {
	/* Only available in secure contexts */
	interface Screen {
		availTop: number;
		availLeft: number;
	}

	var BrowserUIUtils: Gecko.BrowserUIUtils;
	var gBrowser: Gecko.Browser;
	var XULBrowserWindow: nsIXULBrowserWindow;

	interface Window {
		setToolbarVisibility: any;
		updateFxaToolbarMenu: any;
		SidebarUI: any;
		LightweightThemeConsumer: any;
		CustomizableUI: typeof CustomizableUI;
	}
}
