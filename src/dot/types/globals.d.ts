interface Document {
    createXULElement: (element: string) => HTMLElement;
}

interface Window {
    docShell: any;
    XULBrowserWindow: any;
}

declare namespace JSX {
    interface IntrinsicElements {
        'chrome-toolbar': any
    }
}