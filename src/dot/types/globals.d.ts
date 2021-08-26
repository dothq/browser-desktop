declare module '*.ftl'

interface Document {
    createXULElement: (element: string) => HTMLElement;
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
}
