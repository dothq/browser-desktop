import type { Dot } from "../api";
import type { BrowserAccess } from "../services/browser-access";

declare module "*.ftl";

declare global {
    interface Document {
        createXULElement: (
            element: string
        ) => HTMLElement;
    }

    interface Window {
        docShell: any;
        XULBrowserWindow: any;
        windowState: number;
        STATE_MAXIMIZED: number;
        STATE_MINIMIZED: number;
        STATE_NORMAL: number;
        STATE_FULLSCREEN: number;
        content: any;
        openDialog: any;
        windowRoot: {
            ownerGlobal: Window;
        };
        windowUtils: any;
        dot: Dot;
        isChromeWindow: boolean;
        skipNextCanClose: boolean;
        Components: any;
        BROWSER_NEW_TAB_URL: string;
        arguments: any;
        isBlankPageURL: any;
        browserDOMWindow: BrowserAccess;
        gFissionBrowser: boolean;
        RTL_UI: boolean;
        isFullyOccluded: boolean;
        Cr: any;
    }

    interface HTMLElement {
        hidePopup: any;
    }
}
