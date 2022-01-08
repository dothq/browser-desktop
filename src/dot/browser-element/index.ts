import { attr, div, getDOMNode, OikiaElement, render } from "oikia";

// interface BrowserCustomElement extends HTMLBrowserElement {};

interface BrowserCreationOptions {
    isPreloadBrowser: boolean
    name: string
    openWindowInfo: any
    remoteType: string,
    initialBrowsingContextGroupId: any,
    uriIsAboutBlank: boolean,
    userContextId: any,
    skipLoad: boolean,
    initiallyActive: boolean
}

function createBrowser({
    isPreloadBrowser,
    name,
    openWindowInfo,
    remoteType,
    initialBrowsingContextGroupId,
    uriIsAboutBlank,
    userContextId,
    skipLoad,
    initiallyActive
}: BrowserCreationOptions) {
    const browser = document.createXULElement("browser") as OikiaElement as HTMLBrowserElement;

    // browser.permanentKey = new (Cu.getGlobalForObject(Services).Object)();

    const defaultAttributes: Record<any, any> = {
        contextmenu: "contentAreaContextMenu",
        maychangeremoteness: true,
        message: true,
        messagemanagergroup: "browsers",
        selectmenulist: "ContentSelectDropdown",
        tooltip: "aHTMLTooltip",
        type: "content",
    };

    if (!initiallyActive) {
        defaultAttributes.initiallyactive = false;
    }

    if (userContextId) {
        defaultAttributes.usercontextid = userContextId;
    }

    if (remoteType) {
        defaultAttributes.remoteType = remoteType;
        defaultAttributes.remote = true;
    }

    if (!isPreloadBrowser) {
        defaultAttributes.autocompletepopup = "PopupAutoComplete";
    } else {
        defaultAttributes.preloadedState = "preloaded";
    }

    if (initialBrowsingContextGroupId) {
        defaultAttributes.initialBrowsingContextGroupId = initialBrowsingContextGroupId;
    }

    if (openWindowInfo) {
        browser.openWindowInfo = openWindowInfo;
    }

    if (name) {
        defaultAttributes.name = name;
    }

    if (!uriIsAboutBlank || skipLoad) {
        defaultAttributes.nodefaultsrc = true;
    }

    for (const [key, value] of Object.entries(defaultAttributes)) {
        attr(browser, key, value.toString());
    }

    const BrowserContainer = div({ class: "browserview" });
    // We are unable to create XUL elements using Oikia yet
    // Instead we just append the browser to the browser container.
    BrowserContainer.appendChild(browser);

    const rendered = render(
        BrowserContainer,
        getDOMNode("browser-tabs-stack")
    );

    return rendered;
}

// export const BrowserElement = BrowserCustomElement;
// exportPublic("BrowserElement", BrowserElement);