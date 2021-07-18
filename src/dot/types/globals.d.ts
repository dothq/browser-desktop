interface Document {
    createXULElement: (element: string) => HTMLElement;
}

interface Window {
    docShell: any;
    XULBrowserWindow: any;
}

namespace JSX {
  interface IntrinsicElements {
    browser: HTMLElement
  }
  interface Directives {
    // use:____
  }
  interface ExplicitProperties {
    // prop:____
  }
  interface ExplicitAttributes {
      "attr:active": any
      "attr:type": any
  }
  interface CustomEvents {
    // on:____
  }
  interface CustomCaptureEvents {
    // oncapture:____
  }
}