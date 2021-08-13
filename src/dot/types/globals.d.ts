declare module '*.ftl'

interface Document {
    createXULElement: (element: string) => HTMLElement;
}

interface Window {
    docShell: any;
    XULBrowserWindow: any;
}
