import type { BrowserAccess } from "../services/browser-access";
import { MozURI } from "./uri";

declare module "*.ftl";

declare global {
    interface Document {
        hasValidTransientUserGestureActivation: boolean;

        createXULElement: (
            element: string
        ) => HTMLElement;
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

    interface HTMLBrowserElement extends HTMLElement {
        onPageHide: (...args: any) => any;
        resetFields: (...args: any) => any;
        connectedCallback: (...args: any) => any;
        disconnectedCallback: (...args: any) => any;
        autoscrollEnabled: boolean;
        canGoBack: any;
        canGoForward: any;
        currentURI: MozURI;
        documentURI: MozURI;
        lastURI?: MozURI;
        documentContentType: string;
        initialPageLoadedFromUserAction: boolean;
        registeredOpenURI?: MozURI;
        loadContext: object;
        lastLocationChange?: number;
        isNavigating: boolean;
        permanentKey: any;
        autoCompletePopup: object;
        dateTimePicker: object;
        popupAnchor: object;
        droppedLinkHandler: any;
        suspendMediaWhenInactive: boolean;
        docShellIsActive: boolean;
        renderLayers: boolean;
        hasLayers: boolean;
        isRemoteBrowser: boolean;
        remoteType: object;
        isCrashed: boolean;
        messageManager: object;
        webBrowserFind: object;
        mIconURL?: any;
        finder: object;
        fastFind: object;
        outerWindowID: number;
        innerWindowID: number;
        browsingContext: object;
        webNavigation: {
            loadURI: (...args: any) => any
        }
        webProgress: any;
        sessionHistory: object;
        contentTitle: string;
        forceEncodingDetection: (...args: any) => any;
        characterSet: string;
        mayEnableCharacterEncodingMenu: boolean;
        contentPrincipal: any;
        contentPartitionedPrincipal: object;
        cookieJarSettings: object;
        csp: object;
        contentRequestContextID: number;
        referrerInfo: object;
        fullZoom: number;
        textZoom: number;
        enterResponsiveMode: (...args: any) => any;
        leaveResponsiveMode: (...args: any) => any;
        isSyntheticDocument: boolean;
        hasContentOpener: boolean;
        mStrBundle: object;
        audioMuted: boolean;
        shouldHandleUnselectedTabHover: boolean;
        securityUI: object;
        userTypedValue: object;
        dontPromptAndDontUnload: number;
        dontPromptAndUnload: number;
        _wrapURIChangeCall: (...args: any) => any;
        goBack: (...args: any) => any;
        goForward: (...args: any) => any;
        reload: (...args: any) => any;
        reloadWithFlags: (...args: any) => any;
        stop: (...args: any) => any;
        loadURI: (...args: any) => any;
        gotoIndex: (...args: any) => any;
        preserveLayers: (...args: any) => any;
        deprioritize: (...args: any) => any;
        getTabBrowser: (...args: any) => any;
        addProgressListener: (...params: any) => any;
        removeProgressListener: (...args: any) => any;
        audioPlaybackStarted: (...args: any) => any;
        audioPlaybackStopped: (...args: any) => any;
        activeMediaBlockStarted: (...args: any) => any;
        activeMediaBlockStopped: (...args: any) => any;
        mute: (...args: any) => any;
        unmute: (...args: any) => any;
        resumeMedia: (...args: any) => any;
        unselectedTabHover: (...args: any) => any;
        didStartLoadSinceLastUserTyping: (...args: any) => any;
        construct: (...args: any) => any;
        destroy: (...args: any) => any;
        updateForStateChange: (...args: any) => any;
        updateWebNavigationForLocationChange: (...args: any) => any;
        updateForLocationChange: (...args: any) => any;
        purgeSessionHistory: (...args: any) => any;
        createAboutBlankContentViewer: (...args: any) => any;
        stopScroll: (...args: any) => any;
        _getAndMaybeCreateAutoScrollPopup: (...args: any) => any;
        startScroll: (...args: any) => any;
        cancelScroll: (...args: any) => any;
        handleEvent: (...args: any) => any;
        closeBrowser: (...args: any) => any;
        swapBrowsers: (...args: any) => any;
        swapDocShells: (...args: any) => any;
        getInPermitUnload: (...args: any) => any;
        asyncPermitUnload: (...args: any) => any;
        hasBeforeUnload: boolean;
        permitUnload: (...args: any) => any;
        drawSnapshot: (...args: any) => any;
        dropLinks: (...args: any) => any;
        getContentBlockingLog: (...args: any) => any;
        getContentBlockingEvents: (...args: any) => any;
        sendMessageToActor: (...args: any) => any;
        enterModalState: (...args: any) => any;
        leaveModalState: (...args: any) => any;
        maybeLeaveModalState: (...args: any) => any;
        getDevicePermissionOrigins: (...args: any) => any;
        processSwitchBehavior: number;
        prepareToChangeRemoteness: (...args: any) => any;
        afterChangeRemoteness: (...args: any) => any;
        beforeChangeRemoteness: (...args: any) => any;
        finishChangeRemoteness: (...args: any) => any;
        QueryInterface: (...args: any) => any;
        getCustomInterfaceCallback: (...args: any) => any;
        attributeChangedCallback: (...args: any) => any;
        initializeAttributeInheritance: (...args: any) => any;
        inheritAttribute: (...args: any) => any;
        getElementForAttrInheritance: (...args: any) => any;
        delayConnectedCallback: (...args: any) => any;
        isConnectedAndReady: boolean;
        docShell: any;
        contentWindow: object;
        contentDocument: object;
        browserId: number;
        openWindowInfo: object;
        swapFrameLoaders: (...args: any) => any;
        changeRemoteness: (...params: any) => any;
        frameLoader: object;
        doCommand: (...args: any) => any;
        hasMenu: (...args: any) => any;
        openMenu: (...args: any) => any;
        flex: string;
        collapsed: boolean;
        observes: string;
        menu: string;
        contextMenu: string;
        tooltip: string;
        width: string;
        height: string;
        minWidth: string;
        minHeight: string;
        maxWidth: string;
        maxHeight: string;
        screenX: number;
        screenY: number;
        tooltipText: string;
        src: string;
        controllers: object;
    }
}
