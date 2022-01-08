// /* This Source Code Form is subject to the terms of the Mozilla Public
//  * License, v. 2.0. If a copy of the MPL was not distributed with this
//  * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// import {
//     action,
//     computed,
//     makeObservable,
//     observable
// } from "mobx";
// import { Tab } from ".";

// class TabContextualIdentity {
//     @observable
//     private tab: Tab;

//     public CONNECTION_UNSET = -1;
//     public CONNECTION_NOT_SECURE = 0;
//     public CONNECTION_CHROME = 1;
//     public CONNECTION_WEB_EXTENSION = 2;
//     public CONNECTION_LOCAL_FILE = 3;
//     public CONNECTION_SECURE_WITH_EV = 4;
//     public CONNECTION_SECURE_WITH_CERT_OVERRIDE = 5;
//     public CONNECTION_SECURE = 6;
//     public CONNECTION_CERT_ERROR = 7;
//     public CONNECTION_HTTPS_ONLY_ERROR = 8;

//     public CIPHER_STRENGTH_NORMAL = 0;
//     public CIPHER_STRENGTH_WEAK = 1;

//     public HTTPS_ONLY_NO_ACTION = 0;
//     public HTTPS_ONLY_EXCEPTION = 1;
//     public HTTPS_ONLY_FAILED_PARENT = 2;
//     public HTTPS_ONLY_FAILED_CHILD = 3;
//     public HTTPS_ONLY_UPGRADED = 4;

//     public PAGE_LOADING_SECURE_CONTENT = 0; // We can only load https resources
//     public PAGE_LOADING_INSECURE_CONTENT = 1; // We can load https and http resources
//     public PAGE_LOADING_INSECURE_CONTENT_SESSION = 2; // We can only load https and http resources for this session

//     @computed
//     public get useMonoLockIcon() {
//         return dot.prefs.get(
//             "security.secure_connection_icon_color_gray",
//             true
//         );
//     }

//     @computed
//     public get httpsOnlyBrowsingEnabled() {
//         return dot.prefs.get(
//             "dom.security.https_only_mode",
//             false
//         );
//     }

//     @computed
//     public get httpsOnlyInPrivateBrowsingEnabled() {
//         return dot.prefs.get(
//             "dom.security.https_only_mode_pbm",
//             false
//         );
//     }

//     @computed
//     public get extensionPolicy() {
//         const { WebExtensionPolicy } = window as any;
//         const policy = WebExtensionPolicy.getByURI(
//             this.url
//         );

//         try {
//             return policy;
//         } catch (e) {
//             return undefined;
//         }
//     }

//     @computed
//     public get url() {
//         let uri = this.tab.urlParsed;

//         if (uri.schemeIs("view-source")) {
//             uri = Services.io.newURI(
//                 uri.spec.replace(/^view-source:/i, "")
//             );
//         }

//         return uri;
//     }

//     @computed
//     public get isURLLoadedFromFile() {
//         try {
//             let jarUrl = NetUtil.newChannel({
//                 uri: this.url,
//                 loadUsingSystemPrincipal: true
//             }).URI;

//             if (jarUrl.schemeIs("jar")) {
//                 jarUrl = NetUtil.newURI(
//                     jarUrl.pathQueryRef
//                 );
//             }

//             return jarUrl.schemeIs("file");
//         } catch (e) {
//             return false;
//         }
//     }

//     @computed
//     public get securityInfo() {
//         return this.tab.webContents.browsingContext
//             .secureBrowserUI;
//     }

//     @computed
//     public get isAboutUI() {
//         return (
//             this.url.schemeIs("about") &&
//             visibleAboutUrls.includes(
//                 this.url.pathQueryRef.split("?")[0]
//             )
//         );
//     }

//     @computed
//     public get isExtensionPage() {
//         return !!this.extensionPolicy;
//     }

//     @computed
//     public get isLocalPage() {
//         return this.url.schemeIs("file");
//     }

//     @computed
//     public get hasEVCertificate() {
//         return (
//             !this.isURLLoadedFromFile &&
//             this.tab.contentState &
//                 Ci.nsIWebProgressListener
//                     .STATE_IDENTITY_EV_TOPLEVEL
//         );
//     }

//     @computed
//     public get hasUserCertOverrideGesture() {
//         return (
//             this.tab.contentState &
//             Ci.nsIWebProgressListener
//                 .STATE_CERT_USER_OVERRIDDEN
//         );
//     }

//     @computed
//     public get isSecureConnection() {
//         return (
//             !this.isURLLoadedFromFile &&
//             this.tab.contentState &
//                 Ci.nsIWebProgressListener.STATE_IS_SECURE
//         );
//     }

//     @computed
//     public get isBrokenConnection() {
//         return (
//             this.tab.contentState &
//             Ci.nsIWebProgressListener.STATE_IS_BROKEN
//         );
//     }

//     @computed
//     public get hasCustomCertificate() {
//         if (
//             !this.isSecureConnection ||
//             !this.securityInfo ||
//             !this.securityInfo.secInfo
//         )
//             return false;

//         const cert =
//             this.securityInfo.secInfo.succeededCertChain[
//                 this.securityInfo.secInfo
//                     .succeededCertChain.length - 1
//             ];

//         return !cert.isBuiltInRoot;
//     }

//     @computed
//     public get certificateIssuer() {
//         return this.securityInfo.secInfo.serverCert
//             .issuerOrganization;
//     }

//     @action
//     public isDocUriAboutPage(page: string) {
//         const docURI = this.tab.webContents.documentURI;

//         return (
//             docURI &&
//             docURI.scheme == "about" &&
//             docURI.pathQueryRef.startsWith(page)
//         );
//     }

//     @computed
//     public get isCertErrorPage() {
//         return this.isDocUriAboutPage("certerror");
//     }

//     @computed
//     public get isNetErrorPage() {
//         return this.isDocUriAboutPage("neterror");
//     }

//     @computed
//     public get isHTTPSOnlyErrorPage() {
//         return this.isDocUriAboutPage("httpsonlyerror");
//     }

//     @computed
//     public get isBlockedErrorPage() {
//         return this.isDocUriAboutPage("blocked");
//     }

//     @computed
//     public get isChromePage() {
//         const docURI = this.tab.webContents.documentURI;

//         return docURI && docURI.scheme == "chrome";
//     }

//     @computed
//     public get isPDFPage() {
//         return (
//             this.tab.webContents.contentPrincipal
//                 .originNoSuffix == "resource://pdf.js"
//         );
//     }

//     @computed
//     public get isSecureContext() {
//         return this.securityInfo.isSecureContext;
//     }

//     @computed
//     // This is not the same as isLocalPage
//     public get isLocalResource() {
//         return (
//             !this.isBrokenConnection &&
//             !this.isPDFPage &&
//             (this.isSecureContext || this.isChromePage)
//         );
//     }

//     @computed
//     public get hasLoadedMixedPassiveContent() {
//         return (
//             this.tab.contentState &
//             Ci.nsIWebProgressListener
//                 .STATE_LOADED_MIXED_DISPLAY_CONTENT
//         );
//     }

//     @computed
//     public get hasLoadedMixedActiveContent() {
//         return (
//             this.tab.contentState &
//             Ci.nsIWebProgressListener
//                 .STATE_LOADED_MIXED_ACTIVE_CONTENT
//         );
//     }

//     @computed
//     public get hasContentFailedHTTPSOnlyUpgrade() {
//         return (
//             this.tab.contentState &
//             Ci.nsIWebProgressListener
//                 .STATE_HTTPS_ONLY_MODE_UPGRADE_FAILED
//         );
//     }

//     @computed
//     public get hasContentHTTPSOnlyUpgrade() {
//         return (
//             this.tab.contentState &
//             Ci.nsIWebProgressListener
//                 .STATE_HTTPS_ONLY_MODE_UPGRADED
//         );
//     }

//     @computed
//     public get identityHost() {
//         let host = this.tab.url;

//         if (this.tab.urlParsed.schemeIs("file"))
//             return this.tab.urlParsed.filePath;

//         try {
//             if (
//                 this.tab.urlParsed.host &&
//                 this.tab.urlParsed.host.length
//             ) {
//                 host = this.tab.urlParsed.host;
//             } else {
//                 host =
//                     this.tab.urlParsed.spec.split("?")[0];
//             }
//         } catch (e) {
//             host = this.tab.urlParsed.spec.split("?")[0];
//         }

//         return host;
//     }

//     @action
//     public getCertData() {
//         const certificate =
//             this.securityInfo.secInfo.serverCert;
//         const data = { ...certificate };

//         if (certificate.subjectName) {
//             data.subjectNameFields = {};
//             certificate.subjectName
//                 .replace(/,[A-Z]{1,}=/g, (e: string) => {
//                     return `\n${e.substr(1)}`;
//                 })
//                 .split("\n")
//                 .forEach((i: string) => {
//                     const split = i.split("=")[0];

//                     data.subjectNameFields[split[0]] =
//                         split[1];
//                 });

//             data.city = data.subjectNameFields.L;
//             data.state = data.subjectNameFields.ST;
//             data.country = data.subjectNameFields.C;
//         }

//         data.issuer =
//             certificate.issuerOrganization ||
//             certificate.issuerCommonName;

//         return data;
//     }

//     @action
//     public getIdentityStrings() {
//         let msg = "";
//         let icon = "";
//         let colour = "";

//         switch (this.identity.connection) {
//             case this.CONNECTION_NOT_SECURE:
//             case this.CONNECTION_CERT_ERROR:
//                 msg = `Your connection is not secure.`;
//                 icon = "http";
//                 break;
//             case this.CONNECTION_CHROME:
//                 msg = `This is a secure Dot Browser page.`;
//                 icon = "info";
//                 break;
//             case this.CONNECTION_WEB_EXTENSION:
//                 msg = `This is a secure extension page.`;
//                 icon = "extension";
//                 break;
//             case this.CONNECTION_LOCAL_FILE:
//                 msg = `This page is stored on your computer.`;
//                 icon = "file";
//                 break;
//             case this.CONNECTION_SECURE_WITH_EV:
//             case this
//                 .CONNECTION_SECURE_WITH_CERT_OVERRIDE:
//             case this.CONNECTION_SECURE:
//                 msg = `Your connection is secure.`;
//                 icon = "https";
//                 colour = "rgb(9, 193, 87)";
//                 break;
//             case this.CONNECTION_HTTPS_ONLY_ERROR:
//                 msg = `Secure connection is not available.`;
//                 icon = "http";
//                 break;
//             default:
//                 icon = "search";
//                 break;
//         }

//         if (
//             this.url.specIgnoringRef ==
//             BROWSER_NEW_TAB_URL
//         ) {
//             icon = "search";
//         }

//         return {
//             msg,
//             icon,
//             colour
//         };
//     }

//     @computed
//     public get identity() {
//         let connection = this.CONNECTION_UNSET;

//         if (this.isAboutUI) {
//             connection = this.CONNECTION_CHROME;
//         } else if (this.isExtensionPage) {
//             connection = this.CONNECTION_WEB_EXTENSION;
//         } else if (this.isLocalPage) {
//             connection = this.CONNECTION_LOCAL_FILE;
//         } else if (this.hasEVCertificate) {
//             connection = this.CONNECTION_SECURE_WITH_EV;
//         } else if (this.hasUserCertOverrideGesture) {
//             connection =
//                 this.CONNECTION_SECURE_WITH_CERT_OVERRIDE;
//         } else if (this.isSecureConnection) {
//             connection = this.CONNECTION_SECURE;
//         } else if (this.isCertErrorPage) {
//             connection = this.CONNECTION_CERT_ERROR;
//         } else if (this.isHTTPSOnlyErrorPage) {
//             connection = this.CONNECTION_HTTPS_ONLY_ERROR;
//         } else if (
//             this.isNetErrorPage ||
//             this.isBlockedErrorPage
//         ) {
//             connection = this.CONNECTION_NOT_SECURE;
//         } // else if (this.isLocalResource) {
//         //     connection = this.CONNECTION_LOCAL_FILE;
//         // }

//         let cipherStrength = this.CIPHER_STRENGTH_NORMAL;

//         if (
//             this.isBrokenConnection &&
//             !this.hasLoadedMixedActiveContent &&
//             !this.hasLoadedMixedPassiveContent
//         ) {
//             cipherStrength = this.CIPHER_STRENGTH_WEAK;
//         }

//         const isPrivateWindow = dot.window.isPrivate();

//         let httpsOnlyStatus = this.HTTPS_ONLY_NO_ACTION;

//         if (
//             this.httpsOnlyBrowsingEnabled ||
//             (isPrivateWindow &&
//                 this.httpsOnlyInPrivateBrowsingEnabled)
//         ) {
//             let { state } =
//                 SitePermissions.getForPrincipal(
//                     this.tab.webContents.contentPrincipal,
//                     "https-only-load-insecure"
//                 );

//             if (isPrivateWindow) {
//                 if (
//                     state ==
//                     this
//                         .PAGE_LOADING_INSECURE_CONTENT_SESSION
//                 ) {
//                     state =
//                         this
//                             .PAGE_LOADING_INSECURE_CONTENT;
//                 }
//             }

//             if (state > 0)
//                 httpsOnlyStatus =
//                     this.HTTPS_ONLY_EXCEPTION;
//             else if (this.isHTTPSOnlyErrorPage) {
//                 httpsOnlyStatus =
//                     this.HTTPS_ONLY_FAILED_PARENT;
//             } else if (
//                 this.hasContentFailedHTTPSOnlyUpgrade
//             ) {
//                 httpsOnlyStatus =
//                     this.HTTPS_ONLY_FAILED_CHILD;
//             } else if (this.hasContentHTTPSOnlyUpgrade) {
//                 httpsOnlyStatus =
//                     this.HTTPS_ONLY_UPGRADED;
//             }
//         }

//         const data: any = {
//             connection,
//             cipherStrength,
//             isPrivateWindow,
//             httpsOnlyStatus,
//             customRoot: this.hasCustomCertificate
//         };

//         if (this.securityInfo.secInfo) {
//             let ca = {
//                 supplemental: "",
//                 verifiedBy: "",
//                 host: this.identityHost,
//                 owner: ""
//             };

//             const certInfo =
//                 this.securityInfo.secInfo.serverCert;

//             if (this.isSecureConnection) {
//                 if (!this.hasUserCertOverrideGesture) {
//                     ca.verifiedBy =
//                         certInfo.issuerOrganization;
//                 } else {
//                     ca.verifiedBy = `You`;
//                 }
//             }

//             if (this.hasEVCertificate) {
//                 ca.owner = certInfo.organization;

//                 const data = this.getCertData();

//                 if (data.city)
//                     ca.supplemental += `${data.city}\n`;
//                 if (data.state && data.country) {
//                     ca.supplemental += `${data.state}, ${data.country}`;
//                 } else if (data.state) {
//                     ca.supplemental += data.state;
//                 } else if (data.country) {
//                     ca.supplemental += data.country;
//                 }
//             }

//             data.ca = ca;
//         }

//         return data;
//     }

//     constructor(tab: Tab) {
//         makeObservable(this);

//         this.tab = tab;
//     }
// }

// export default TabContextualIdentity;