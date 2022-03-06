import { Browser } from "browser/components/main";
import { TabBrowserStartup } from "browser/components/main/startup";
import { ChromeUtils } from "mozilla";

declare global {
	interface Document {
		hasValidTransientUserGestureActivation: boolean;

		createXULElement: (element: string) => HTMLElement;
	}

	interface Window {
		docShell: any;
		XULBrowserWindow: any;
		windowReady: boolean;
		windowState: number;
		STATE_MAXIMIZED: number;
		STATE_MINIMIZED: number;
		STATE_NORMAL: number;
		STATE_FULLSCREEN: number;
		content: any;
		openDialog: any;
		PathUtils: any;
		ChromeUtils: typeof ChromeUtils;
		IOUtils: {
			copy: (...args: any) => any;
			exists: (...args: any) => any;
			getChildren: (...args: any) => any;
			makeDirectory: (...args: any) => any;
			move: (...args: any) => any;
			read: (...args: any) => any;
			readJSON: (...args: any) => any;
			readUTF8: (...args: any) => any;
			remove: (...args: any) => any;
			setPermissions: (...args: any) => any;
			stat: (...args: any) => any;
			touch: (...args: any) => any;
			write: (...args: any) => any;
			writeJSON: (...args: any) => any;
			writeUTF8: (...args: any) => any;
		};
		dump: (...args: any) => any;
		windowRoot: {
			ownerGlobal: Window;
		};
		windowUtils: any;
		isChromeWindow: boolean;
		skipNextCanClose: boolean;
		Components: any;
		BROWSER_NEW_TAB_URL: string;
		arguments: any;
		isBlankPageURL: any;
		browserDOMWindow: any;
		gFissionBrowser: boolean;
		RTL_UI: boolean;
		isFullyOccluded: boolean;
		Cr: any;
		Cc: any;
		Ci: any;
		Cu: any;
		Services: any;
		gBrowser: Browser;
		gBrowserInit: TabBrowserStartup;
		[key: string]: any;
	}

	interface HTMLElement {
		hidePopup: any;
	}
}
