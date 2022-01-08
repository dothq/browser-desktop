// import { dot } from "../api";
// import { Cc, ChromeUtils, Ci, Services } from "../modules";
// import StatusService from "../services/status";
// import { MozURI } from "../types/uri";
// import { BrowserUIUtils } from "./browser-ui";

// export const XULBrowserWindow = {
//     status: "",
//     defaultStatus: "",
//     overLink: "",
//     startTime: 0,
//     isBusy: false,
//     busyUI: false,

//     QueryInterface: ChromeUtils.generateQI([
//         "nsIWebProgressListener",
//         "nsIWebProgressListener2",
//         "nsISupportsWeakReference",
//         "nsIXULBrowserWindow"
//     ]),

//     showTooltip(
//         x: number,
//         y: number,
//         data: string,
//         direction: string
//     ) {
//         if (
//             Cc["@mozilla.org/widget/dragservice;1"]
//                 .getService(Ci.nsIDragService)
//                 .getCurrentSession()
//         ) {
//             return;
//         }

//         let el: any = document.getElementById(
//             "browser-tooltip"
//         );
//         el.label = data;
//         el.style.direction = direction;
//         el.openPopupAtScreen(x, y, false, null);
//     },

//     hideTooltip() {
//         let el: any = document.getElementById(
//             "browser-tooltip"
//         );
//         el.hidePopup();
//     },

//     setDefaultStatus(status: string) {
//         this.defaultStatus = status;
//         StatusService.update(status);
//     },

//     setOverLink(url: string) {
//         if (url) {
//             url =
//                 Services.textToSubURI.unEscapeURIForUI(
//                     url
//                 );

//             // Encode bidirectional formatting characters.
//             // (RFC 3987 sections 3.2 and 4.1 paragraph 6)
//             url = url.replace(
//                 /[\u200e\u200f\u202a\u202b\u202c\u202d\u202e]/g,
//                 encodeURIComponent
//             );
//         }

//         this.overLink = url;
//         StatusService.update(this.overLink);
//     },

//     getTabCount() {
//         return dot.tabs.list.length;
//     },

//     onStateChange(
//         webProgress: any,
//         request: any,
//         stateFlags: any,
//         status: any
//     ) {},

//     onLocationChange(
//         webProgress: any,
//         request: any,
//         location: MozURI,
//         flags: any,
//         isSimulated: boolean
//     ) {
//         const uri = location ? location.spec : "";

//         // todo: Update back and forward buttons here instead of whenever Redux updates

//         Services.obs.notifyObservers(
//             webProgress,
//             "touchbar-location-change",
//             uri
//         );

//         if (!webProgress.isTopLevel) return;

//         this.setOverLink("");

//         if (
//             (uri == "about:blank" &&
//                 BrowserUIUtils.checkEmptyPageOrigin(
//                     dot.tabs.selectedTab?.webContents
//                 )) ||
//             uri == ""
//         ) {
//             // Disable reload button
//         } else {
//             // Enable reload button
//         }

//         this.updateElementsForContentType();
//     },

//     // Stubs
//     updateElementsForContentType() {},
//     asyncUpdateUI() {},
//     onContentBlockingEvent() {},
//     onSecurityChange() {},

//     _state: null,
//     _lastLocation: null,
//     _event: null,
//     _lastLocationForEvent: null,
//     _isSecureContext: null,

//     onUpdateCurrentBrowser(
//         stateFlags: number,
//         status: any,
//         message: any,
//         totalProgress: any
//     ) {
//         const { nsIWebProgressListener } = Ci;

//         const browser = dot.tabs.selectedTab?.webContents;

//         this.hideTooltip();

//         const doneLoading =
//             stateFlags &
//             nsIWebProgressListener.STATE_STOP;

//         this.onStateChange(
//             browser.webProgress,
//             { URI: browser.currentURI },
//             doneLoading
//                 ? nsIWebProgressListener.STATE_STOP
//                 : nsIWebProgressListener.STATE_START,
//             status
//         );
//     }
// }
