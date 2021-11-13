import React from "react";
import ReactDOM from "react-dom";
import { dot } from "../../api";
import { Ci, Cr, E10SUtils, Services } from "../../modules";
import { MozURI } from "../../types/uri";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            browser: React.DetailedHTMLProps<BrowserHTMLAttributes<HTMLBrowserElement>, HTMLBrowserElement>;
        }
    }

    interface BrowserHTMLAttributes<T> extends React.HTMLAttributes<T> {
        autoscroll?: boolean;
        autocompletepopup?: string;
        datetimepicker?: string;
        remote?: boolean;
        disablehistory?: boolean;
        disableglobalhistory?: boolean;
        selectmenulist?: string;
        maychangeremoteness?: boolean;
        disablefullscreen?: boolean;
        tooltip?: string;
        src?: string;
        type?: string;
        remoteType?: string;
        primary?: boolean;
        nodefaultsrc?: boolean;
        messagemanagergroup?: string;
        xmlns?: string;
    }

    interface HTMLBrowserElement extends HTMLElement {
        onPageHide: () => any
        resetFields: () => any
        connectedCallback: () => any
        disconnectedCallback: () => any
        autoscrollEnabled: boolean
        canGoBack: any
        canGoForward: any
        currentURI: object
        documentURI: object
        documentContentType: string
        loadContext: object
        autoCompletePopup: object
        dateTimePicker: object
        popupAnchor: object
        suspendMediaWhenInactive: boolean
        docShellIsActive: boolean
        renderLayers: boolean
        hasLayers: boolean
        isRemoteBrowser: boolean
        remoteType: object
        isCrashed: boolean
        messageManager: object
        webBrowserFind: object
        finder: object
        fastFind: object
        outerWindowID: number
        innerWindowID: number
        browsingContext: object
        webNavigation: object
        webProgress: any
        sessionHistory: object
        contentTitle: string
        forceEncodingDetection: () => any
        characterSet: string
        mayEnableCharacterEncodingMenu: boolean
        contentPrincipal: object
        contentPartitionedPrincipal: object
        cookieJarSettings: object
        csp: object
        contentRequestContextID: number
        referrerInfo: object
        fullZoom: number
        textZoom: number
        enterResponsiveMode: () => any
        leaveResponsiveMode: () => any
        isSyntheticDocument: boolean
        hasContentOpener: boolean
        mStrBundle: object
        audioMuted: boolean
        shouldHandleUnselectedTabHover: boolean
        securityUI: object
        userTypedValue: object
        dontPromptAndDontUnload: number
        dontPromptAndUnload: number
        _wrapURIChangeCall: () => any
        goBack: () => any
        goForward: () => any
        reload: () => any
        reloadWithFlags: () => any
        stop: () => any
        loadURI: (url: MozURI, params?: any) => any
        gotoIndex: () => any
        preserveLayers: () => any
        deprioritize: () => any
        getTabBrowser: () => any
        addProgressListener: (...params: any) => any
        removeProgressListener: () => any
        audioPlaybackStarted: () => any
        audioPlaybackStopped: () => any
        activeMediaBlockStarted: () => any
        activeMediaBlockStopped: () => any
        mute: () => any
        unmute: () => any
        resumeMedia: () => any
        unselectedTabHover: () => any
        didStartLoadSinceLastUserTyping: () => any
        construct: () => any
        destroy: () => any
        updateForStateChange: () => any
        updateWebNavigationForLocationChange: () => any
        updateForLocationChange: () => any
        purgeSessionHistory: () => any
        createAboutBlankContentViewer: () => any
        stopScroll: () => any
        _getAndMaybeCreateAutoScrollPopup: () => any
        startScroll: () => any
        cancelScroll: () => any
        handleEvent: () => any
        closeBrowser: () => any
        swapBrowsers: () => any
        swapDocShells: () => any
        getInPermitUnload: () => any
        asyncPermitUnload: () => any
        hasBeforeUnload: boolean
        permitUnload: () => any
        drawSnapshot: () => any
        dropLinks: () => any
        getContentBlockingLog: () => any
        getContentBlockingEvents: () => any
        sendMessageToActor: () => any
        enterModalState: () => any
        leaveModalState: () => any
        maybeLeaveModalState: () => any
        getDevicePermissionOrigins: () => any
        processSwitchBehavior: number
        prepareToChangeRemoteness: () => any
        afterChangeRemoteness: () => any
        beforeChangeRemoteness: () => any
        finishChangeRemoteness: () => any
        QueryInterface: () => any
        getCustomInterfaceCallback: () => any
        attributeChangedCallback: () => any
        initializeAttributeInheritance: () => any
        inheritAttribute: () => any
        getElementForAttrInheritance: () => any
        delayConnectedCallback: () => any
        isConnectedAndReady: boolean
        docShell: any
        contentWindow: object
        contentDocument: object
        browserId: number
        openWindowInfo: object
        swapFrameLoaders: () => any
        changeRemoteness: (...params: any) => any
        frameLoader: object
        doCommand: () => any
        hasMenu: () => any
        openMenu: () => any
        flex: string
        collapsed: boolean
        observes: string
        menu: string
        contextMenu: string
        tooltip: string
        width: string
        height: string
        minWidth: string
        minHeight: string
        maxWidth: string
        maxHeight: string
        screenX: number
        screenY: number
        tooltipText: string
        src: string
        controllers: object    
    }
}

export class Browser extends React.Component<BrowserHTMLAttributes<HTMLBrowserElement>> {
    public ref: HTMLDivElement | null = null;
    public browser: HTMLBrowserElement | null = null;

    public componentDidMount() {
        const browserContainer = ReactDOM.findDOMNode(this.ref) as HTMLDivElement;
        const browser = document.createXULElement("browser") as HTMLBrowserElement;

        for(const [key, value] of Object.entries(this.props)) {
            browser.setAttribute(key, value.toString());
        }

        browserContainer.parentNode?.replaceChild(
            browser, 
            browserContainer
        );

        dot.dev.launchBrowserToolbox();

        this.browser = browser;

        this.doInitialLoad();
        this.registerProgressListeners();
    }

    public doInitialLoad() {
        if(!this.browser) return;

        if(this.props.src) {
            try {
                const parsed = Services.io.newURI(this.props.src);

                this.browser?.loadURI(parsed);
            } catch(e) {
                dot.tabs.updateBrowserRemoteness(
                    this.browser,
                    { remoteType: E10SUtils.NOT_REMOTE }
                );

                this.browser.docShell.displayLoadError(
                    Cr.NS_ERROR_MALFORMED_URI,
                    this.browser.currentURI,
                    null
                );
            }
        }
    }

    public registerProgressListeners() {
        this.browser?.addProgressListener(
            (webProgress: any, request: any, location: any) => {
                this.browser?.setAttribute("src", location.spec);
            }, 
            Ci.nsIWebProgress.NOTIFY_LOCATION
        );
    }

    public render() {
        return <div ref={(ref) => { this.ref = ref }}></div>
    }
}