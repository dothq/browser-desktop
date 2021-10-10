import type { Dot } from "../api";

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
        dot: Dot;
    }
}
