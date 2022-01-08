// import { dot } from "../api";
// import {
//     AppConstants,
//     BrowserWindowTracker,
//     ChromeUtils,
//     Ci,
//     PrivateBrowsingUtils,
//     ReferrerInfo,
//     Services
// } from "../modules";
// import { makeURI } from "../utils/browser";

// export class BrowserAccess {
//     public QueryInterface = ChromeUtils.generateQI([
//         "nsIBrowserDOMWindow"
//     ]);

//     public openURIInNewTab(
//         uri: any,
//         referrerInfo: any,
//         isPrivate: any,
//         isExternal: any,
//         forceNotRemote = false,
//         userContextId = Ci.nsIScriptSecurityManager
//             .DEFAULT_USER_CONTEXT_ID,
//         openWindowInfo = null,
//         openerBrowser = null,
//         triggeringPrincipal = null,
//         name = "",
//         csp = null,
//         skipLoad = false
//     ) {
//         return this._openURIInNewTab(
//             uri,
//             referrerInfo,
//             isPrivate,
//             isExternal,
//             forceNotRemote,
//             userContextId,
//             openWindowInfo,
//             openerBrowser,
//             triggeringPrincipal,
//             name,
//             csp,
//             skipLoad
//         );
//     }

//     public _openURIInNewTab(
//         uri: any,
//         referrerInfo: any,
//         isPrivate: any,
//         isExternal: any,
//         forceNotRemote = false,
//         userContextId = Ci.nsIScriptSecurityManager
//             .DEFAULT_USER_CONTEXT_ID,
//         openWindowInfo = null,
//         openerBrowser = null,
//         triggeringPrincipal = null,
//         name = "",
//         csp = null,
//         skipLoad = false
//     ) {
//         let win;
//         let needToFocusWin = false;

//         if (window.toolbar.visible) {
//             win = window;
//         } else {
//             win = BrowserWindowTracker.getTopWindow({
//                 private: isPrivate
//             });
//             needToFocusWin = true;
//         }

//         if (!win) return null;

//         if (
//             isExternal &&
//             (!uri || uri.spec == "about:blank")
//         ) {
//             win.BrowserOpenTab();
//             win.focus();

//             return win.dot.tabs.selectedTab.webContents;
//         }

//         const loadInBackground = dot.prefs.get(
//             "browser.tabs.loadDivertedInBackground"
//         );

//         win.dot.tabs.create({
//             url: uri ? uri.spec : "about:blank",
//             triggeringPrincipal,
//             referrerInfo,
//             userContextId,
//             fromExternal: isExternal,
//             inBackground: loadInBackground,
//             forceNotRemote,
//             openWindowInfo,
//             openerBrowser,
//             name,
//             csp,
//             skipLoad
//         });

//         if (
//             needToFocusWin ||
//             (!loadInBackground && isExternal)
//         ) {
//             win.focus();
//         }

//         return;
//     }

//     public createContentWindow(
//         uri: any,
//         openWindowInfo: any,
//         where: any,
//         flags: any,
//         triggeringPrincipal: any,
//         csp: any
//     ) {
//         return this.getContentWindowOrOpenURI(
//             null,
//             openWindowInfo,
//             where,
//             flags,
//             triggeringPrincipal,
//             csp,
//             true
//         );
//     }

//     public openURI(
//         uri: any,
//         openWindowInfo: any,
//         where: any,
//         flags: any,
//         triggeringPrincipal: any,
//         csp: any
//     ) {
//         if (!uri) return;

//         return this.getContentWindowOrOpenURI(
//             uri,
//             openWindowInfo,
//             where,
//             flags,
//             triggeringPrincipal,
//             csp,
//             false
//         );
//     }

//     public getContentWindowOrOpenURI(
//         uri: any,
//         openWindowInfo: any,
//         where: any,
//         flags: any,
//         triggeringPrincipal: any,
//         csp: any,
//         skipLoad: any
//     ) {
//         const {
//             OPEN_EXTERNAL,
//             OPEN_DEFAULTWINDOW,
//             OPEN_NO_REFERRER,
//             OPEN_NEWWINDOW,
//             OPEN_NEWTAB,
//             OPEN_PRINT_BROWSER
//         } = Ci.nsIBrowserDOMWindow;

//         const { DEFAULT_USER_CONTEXT_ID } =
//             Ci.nsIScriptSecurityManager;

//         const {
//             LOAD_FLAGS_NONE,
//             LOAD_FLAGS_FROM_EXTERNAL,
//             LOAD_FLAGS_FIRST_LOAD
//         } = Ci.nsIWebNavigation;

//         let browsingContext: any = null;
//         const isExternal = !!(flags & OPEN_EXTERNAL);

//         if (openWindowInfo && isExternal) {
//             throw new Error(
//                 "openURI did not expect openWindowInfo to be passed if the context is OPEN_EXTERNAL."
//             );
//         }

//         // You should use the --chrome argument instead
//         if (isExternal && uri && uri.schemeIs("chrome"))
//             return;

//         if (where == OPEN_DEFAULTWINDOW) {
//             if (
//                 isExternal &&
//                 dot.prefs.get(
//                     "browser.link.open_newwindow.override.external"
//                 ) !== "undefined"
//             ) {
//                 where = dot.prefs.get(
//                     "browser.link.open_newwindow.override.external"
//                 );
//             } else {
//                 where = dot.prefs.get(
//                     "browser.link.open_newwindow"
//                 );
//             }
//         }

//         let referrerInfo;

//         if (flags & OPEN_NO_REFERRER) {
//             referrerInfo = new ReferrerInfo(
//                 Ci.nsIReferrerInfo.EMPTY,
//                 false,
//                 null
//             );
//         } else if (
//             openWindowInfo &&
//             openWindowInfo.parent &&
//             openWindowInfo.parent.window
//         ) {
//             referrerInfo = new ReferrerInfo(
//                 openWindowInfo.parent.window.document.referrerInfo.referrerPolicy,
//                 true,
//                 makeURI(
//                     openWindowInfo.parent.window.location
//                         .href
//                 )
//             );
//         } else {
//             referrerInfo = new ReferrerInfo(
//                 Ci.nsIReferrerInfo.EMPTY,
//                 true,
//                 null
//             );
//         }

//         const isPrivate = openWindowInfo
//             ? openWindowInfo.originAttributes
//                   .privateBrowsingId != 0
//             : PrivateBrowsingUtils.isWindowPrivate(
//                   window
//               );

//         switch (where) {
//             case OPEN_NEWWINDOW:
//                 const url = uri && uri.spec;

//                 let features = "all,dialog=no";

//                 if (isPrivate) {
//                     features += ",private";
//                 }

//                 try {
//                     window.openDialog(
//                         AppConstants.BROWSER_CHROME_URL,
//                         "_blank",
//                         features,
//                         // window.arguments
//                         url,
//                         null,
//                         null,
//                         null,
//                         null,
//                         null,
//                         null,
//                         null,
//                         triggeringPrincipal,
//                         null,
//                         csp,
//                         openWindowInfo
//                     );

//                     browsingContext = null;
//                 } catch (e) {
//                     throw e;
//                 }

//                 break;
//             case OPEN_NEWTAB:
//                 const forceNotRemote =
//                     openWindowInfo &&
//                     !openWindowInfo.isRemote;

//                 const userContextId = openWindowInfo
//                     ? openWindowInfo.originAttributes
//                           .userContextId
//                     : DEFAULT_USER_CONTEXT_ID;

//                 const browser = this._openURIInNewTab(
//                     uri,
//                     referrerInfo,
//                     isPrivate,
//                     isExternal,
//                     forceNotRemote,
//                     userContextId,
//                     openWindowInfo,
//                     null,
//                     triggeringPrincipal,
//                     "",
//                     csp,
//                     skipLoad
//                 );

//                 if (browser)
//                     browsingContext =
//                         browser.browsingContext;

//                 break;
//             case OPEN_PRINT_BROWSER: {
//                 // todo add printing popup
//                 break;
//             }
//             default:
//                 if (uri) {
//                     let loadFlags = LOAD_FLAGS_NONE;

//                     if (isExternal) {
//                         loadFlags |=
//                             LOAD_FLAGS_FROM_EXTERNAL;
//                     } else if (
//                         !triggeringPrincipal.isSystemPrincipal
//                     ) {
//                         loadFlags |=
//                             LOAD_FLAGS_FIRST_LOAD;
//                     }

//                     dot.tabs.selectedTab?.goto(uri.spec, {
//                         triggeringPrincipal,
//                         csp,
//                         loadFlags,
//                         referrerInfo
//                     });
//                 }

//                 if (
//                     !dot.prefs.get(
//                         "browser.tabs.loadDivertedInBackground"
//                     )
//                 ) {
//                     window.focus();
//                 }
//         }
//         return browsingContext;
//     }

//     public createContentWindowInFrame(
//         uri: any,
//         params: any,
//         where: any,
//         flags: any,
//         name: any
//     ) {
//         return this.getContentWindowOrOpenURIInFrame(
//             null,
//             params,
//             where,
//             flags,
//             name,
//             true
//         );
//     }

//     public openURIInFrame(
//         uri: any,
//         params: any,
//         where: any,
//         flags: any,
//         name: any,
//         skipLoad: any
//     ) {
//         return this.getContentWindowOrOpenURIInFrame(
//             uri,
//             params,
//             where,
//             flags,
//             name,
//             false
//         );
//     }

//     public getContentWindowOrOpenURIInFrame(
//         uri: any,
//         params: any,
//         where: any,
//         flags: any,
//         name: any,
//         skipLoad: any
//     ) {
//         const {
//             OPEN_PRINT_BROWSER,
//             OPEN_NEWTAB,
//             OPEN_EXTERNAL
//         } = Ci.nsIBrowserDOMWindow;

//         const { DEFAULT_USER_CONTEXT_ID } =
//             Ci.nsIScriptSecurityManager;

//         const {
//             openerOriginAttributes,
//             referrerInfo,
//             isPrivate,
//             openWindowInfo,
//             openerBrowser,
//             triggeringPrincipal,
//             csp
//         } = params;

//         if (where == OPEN_PRINT_BROWSER) {
//             // todo: open print popup
//             return;
//         }

//         if (where !== OPEN_NEWTAB) return;

//         const isExternal = !!(flags & OPEN_EXTERNAL);

//         const userContextId =
//             openerOriginAttributes &&
//             "userContextId" in openerOriginAttributes
//                 ? params.openerOriginAttributes
//                       .userContextId
//                 : DEFAULT_USER_CONTEXT_ID;

//         return this._openURIInNewTab(
//             uri,
//             referrerInfo,
//             isPrivate,
//             isExternal,
//             false,
//             userContextId,
//             openWindowInfo,
//             openerBrowser,
//             triggeringPrincipal,
//             name,
//             csp,
//             skipLoad
//         );
//     }

//     public canClose() {
//         if (
//             Services.startup.shuttingDown ||
//             window.skipNextCanClose
//         ) {
//             return true;
//         }

//         for (const tab of dot.tabs.list) {
//             if (!tab.webContents.isConnected) {
//                 continue;
//             }

//             const { permitUnload } =
//                 tab.webContents.permitUnload();

//             if (!permitUnload) return false;
//         }
//         return true;
//     }

//     public get tabCount() {
//         return dot.tabs.list.length;
//     }
// }
