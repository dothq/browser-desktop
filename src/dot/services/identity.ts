import { dot } from "../api";
import { Tab } from "../models/Tab";
import {
    Ci,
    NetUtil,
    Services,
    SitePermissions
} from "../modules";
import { NEW_TAB_URL_PARSED } from "../shared/tab";
import { visibleAboutUrls } from "../shared/url";

class IdentityManager {
    private tab: Tab;

    public CONNECTION_UNSET = -1;
    public CONNECTION_NOT_SECURE = 0;
    public CONNECTION_CHROME = 1;
    public CONNECTION_WEB_EXTENSION = 2;
    public CONNECTION_LOCAL_FILE = 3;
    public CONNECTION_SECURE_WITH_EV = 4;
    public CONNECTION_SECURE_WITH_CERT_OVERRIDE = 5;
    public CONNECTION_SECURE = 6;
    public CONNECTION_CERT_ERROR = 7;
    public CONNECTION_HTTPS_ONLY_ERROR = 8;

    public CIPHER_STRENGTH_NORMAL = 0;
    public CIPHER_STRENGTH_WEAK = 1;

    public HTTPS_ONLY_NO_ACTION = 0;
    public HTTPS_ONLY_EXCEPTION = 1;
    public HTTPS_ONLY_FAILED_PARENT = 2;
    public HTTPS_ONLY_FAILED_CHILD = 3;
    public HTTPS_ONLY_UPGRADED = 4;

    public PAGE_LOADING_SECURE_CONTENT = 0; // We can only load https resources
    public PAGE_LOADING_INSECURE_CONTENT = 1; // We can load https and http resources
    public PAGE_LOADING_INSECURE_CONTENT_SESSION = 2; // We can only load https and http resources for this session

    public get useMonoLockIcon() {
        return dot.prefs.get(
            "security.secure_connection_icon_color_gray",
            true
        );
    }

    public get httpsOnlyBrowsingEnabled() {
        return dot.prefs.get(
            "dom.security.https_only_mode",
            false
        );
    }

    public get httpsOnlyInPrivateBrowsingEnabled() {
        return dot.prefs.get(
            "dom.security.https_only_mode_pbm",
            false
        );
    }

    public get extensionPolicy() {
        const { WebExtensionPolicy } = window as any;
        const policy = WebExtensionPolicy.getByURI(
            this.url
        );

        try {
            return policy;
        } catch (e) {
            return undefined;
        }
    }

    public get url() {
        let uri = this.tab.urlParsed;

        if (uri.schemeIs("view-source")) {
            uri = Services.io.newURI(
                uri.spec.replace(/^view-source:/i, "")
            );
        }

        return uri;
    }

    public get isURLLoadedFromFile() {
        try {
            let jarUrl = NetUtil.newChannel({
                uri: this.url,
                loadUsingSystemPrincipal: true
            }).URI;

            if (jarUrl.schemeIs("jar")) {
                jarUrl = NetUtil.newURI(
                    jarUrl.pathQueryRef
                );
            }

            return jarUrl.schemeIs("file");
        } catch (e) {
            return false;
        }
    }

    public get securityInfo() {
        return this.tab.webContents.browsingContext
            .secureBrowserUI;
    }

    public get isAboutUI() {
        return (
            this.url.schemeIs("about") &&
            visibleAboutUrls.includes(
                this.url.pathQueryRef.split("?")[0]
            )
        );
    }

    public get isExtensionPage() {
        return !!this.extensionPolicy;
    }

    public get isLocalPage() {
        return this.url.schemeIs("file");
    }

    public get hasEVCertificate() {
        return (
            !this.isURLLoadedFromFile &&
            this.tab.contentState &
                Ci.nsIWebProgressListener
                    .STATE_IDENTITY_EV_TOPLEVEL
        );
    }

    public get hasUserCertOverrideGesture() {
        return (
            this.tab.contentState &
            Ci.nsIWebProgressListener
                .STATE_CERT_USER_OVERRIDDEN
        );
    }

    public get isSecureConnection() {
        return (
            !this.isURLLoadedFromFile &&
            this.tab.contentState &
                Ci.nsIWebProgressListener.STATE_IS_SECURE
        );
    }

    public get isBrokenConnection() {
        return (
            this.tab.contentState &
            Ci.nsIWebProgressListener.STATE_IS_BROKEN
        );
    }

    public get hasCustomCertificate() {
        if (!this.isSecureConnection) return false;

        const cert =
            this.securityInfo.secInfo.succeededCertChain[
                this.securityInfo.secInfo
                    .succeededCertChain.length - 1
            ];

        return !cert.isBuiltInRoot;
    }

    public get certificateIssuer() {
        return this.securityInfo.secInfo.serverCert
            .issuerOrganization;
    }

    public isDocUriAboutPage(page: string) {
        const docURI = this.tab.webContents.documentURI;

        return (
            docURI &&
            docURI.scheme == "about" &&
            docURI.pathQueryRef.startsWith(page)
        );
    }

    public get isCertErrorPage() {
        return this.isDocUriAboutPage("certerror");
    }

    public get isNetErrorPage() {
        return this.isDocUriAboutPage("neterror");
    }

    public get isHTTPSOnlyErrorPage() {
        return this.isDocUriAboutPage("httpsonlyerror");
    }

    public get isBlockedErrorPage() {
        return this.isDocUriAboutPage("blocked");
    }

    public get isChromePage() {
        const docURI = this.tab.webContents.documentURI;

        return docURI && docURI.scheme == "chrome";
    }

    public get isPDFPage() {
        return (
            this.tab.webContents.contentPrincipal
                .originNoSuffix == "resource://pdf.js"
        );
    }

    public get isSecureContext() {
        return this.securityInfo.isSecureContext;
    }

    // This is not the same as isLocalPage
    public get isLocalResource() {
        return (
            !this.isBrokenConnection &&
            !this.isPDFPage &&
            (this.isSecureContext || this.isChromePage)
        );
    }

    public get hasLoadedMixedPassiveContent() {
        return (
            this.tab.contentState &
            Ci.nsIWebProgressListener
                .STATE_LOADED_MIXED_DISPLAY_CONTENT
        );
    }

    public get hasLoadedMixedActiveContent() {
        return (
            this.tab.contentState &
            Ci.nsIWebProgressListener
                .STATE_LOADED_MIXED_ACTIVE_CONTENT
        );
    }

    public get hasContentFailedHTTPSOnlyUpgrade() {
        return (
            this.tab.contentState &
            Ci.nsIWebProgressListener
                .STATE_HTTPS_ONLY_MODE_UPGRADE_FAILED
        );
    }

    public get hasContentHTTPSOnlyUpgrade() {
        return (
            this.tab.contentState &
            Ci.nsIWebProgressListener
                .STATE_HTTPS_ONLY_MODE_UPGRADED
        );
    }

    public get identityHost() {
        let host = this.tab.url;

        if (this.tab.urlParsed.schemeIs("file"))
            return this.tab.urlParsed.filePath;

        try {
            if (
                this.tab.urlParsed.host &&
                this.tab.urlParsed.host.length
            ) {
                host = this.tab.urlParsed.host;
            } else {
                host =
                    this.tab.urlParsed.spec.split("?")[0];
            }
        } catch (e) {
            host = this.tab.urlParsed.spec.split("?")[0];
        }

        return host;
    }

    public getCertData() {
        const certificate =
            this.securityInfo.secInfo.serverCert;
        const data = { ...certificate };

        if (certificate.subjectName) {
            data.subjectNameFields = {};
            certificate.subjectName
                .replace(/,[A-Z]{1,}=/g, (e: string) => {
                    return `\n${e.substr(1)}`;
                })
                .split("\n")
                .forEach((i: string) => {
                    const split = i.split("=")[0];

                    data.subjectNameFields[split[0]] =
                        split[1];
                });

            data.city = data.subjectNameFields.L;
            data.state = data.subjectNameFields.ST;
            data.country = data.subjectNameFields.C;
        }

        data.issuer =
            certificate.issuerOrganization ||
            certificate.issuerCommonName;

        return data;
    }

    public getIdentityStrings() {
        let msg = "";
        let icon = "";
        let colour = "";

        switch (this.identity.connection) {
            case this.CONNECTION_NOT_SECURE:
            case this.CONNECTION_CERT_ERROR:
                msg = `Your connection is not secure.`;
                icon = "http";
                break;
            case this.CONNECTION_CHROME:
                msg = `This is a secure Dot Browser page.`;
                icon = "info";
                break;
            case this.CONNECTION_WEB_EXTENSION:
                msg = `This is a secure extension page.`;
                icon = "extension";
                break;
            case this.CONNECTION_LOCAL_FILE:
                msg = `This page is stored on your computer.`;
                icon = "file";
                break;
            case this.CONNECTION_SECURE_WITH_EV:
            case this
                .CONNECTION_SECURE_WITH_CERT_OVERRIDE:
            case this.CONNECTION_SECURE:
                msg = `Your connection is secure.`;
                icon = "https";
                colour = "rgb(9, 193, 87)";
                break;
            case this.CONNECTION_HTTPS_ONLY_ERROR:
                msg = `Secure connection is not available.`;
                icon = "http";
                break;
            default:
                icon = "search";
                break;
        }

        if (
            this.url.specIgnoringRef ==
            NEW_TAB_URL_PARSED.spec
        ) {
            icon = "search";
        }

        return {
            msg,
            icon,
            colour
        };
    }

    public get identity() {
        let connection = this.CONNECTION_UNSET;

        if (this.isAboutUI) {
            connection = this.CONNECTION_CHROME;
        } else if (this.isExtensionPage) {
            connection = this.CONNECTION_WEB_EXTENSION;
        } else if (this.isLocalPage) {
            connection = this.CONNECTION_LOCAL_FILE;
        } else if (this.hasEVCertificate) {
            connection = this.CONNECTION_SECURE_WITH_EV;
        } else if (this.hasUserCertOverrideGesture) {
            connection =
                this.CONNECTION_SECURE_WITH_CERT_OVERRIDE;
        } else if (this.isSecureConnection) {
            connection = this.CONNECTION_SECURE;
        } else if (this.isCertErrorPage) {
            connection = this.CONNECTION_CERT_ERROR;
        } else if (this.isHTTPSOnlyErrorPage) {
            connection = this.CONNECTION_HTTPS_ONLY_ERROR;
        } else if (
            this.isNetErrorPage ||
            this.isBlockedErrorPage
        ) {
            connection = this.CONNECTION_NOT_SECURE;
        } // else if (this.isLocalResource) {
        //     connection = this.CONNECTION_LOCAL_FILE;
        // }

        let cipherStrength = this.CIPHER_STRENGTH_NORMAL;

        if (
            this.isBrokenConnection &&
            !this.hasLoadedMixedActiveContent &&
            !this.hasLoadedMixedPassiveContent
        ) {
            cipherStrength = this.CIPHER_STRENGTH_WEAK;
        }

        const isPrivateWindow = dot.window.isPrivate();

        let httpsOnlyStatus = this.HTTPS_ONLY_NO_ACTION;

        if (
            this.httpsOnlyBrowsingEnabled ||
            (isPrivateWindow &&
                this.httpsOnlyInPrivateBrowsingEnabled)
        ) {
            let { state } =
                SitePermissions.getForPrincipal(
                    this.tab.webContents.contentPrincipal,
                    "https-only-load-insecure"
                );

            if (isPrivateWindow) {
                if (
                    state ==
                    this
                        .PAGE_LOADING_INSECURE_CONTENT_SESSION
                ) {
                    state =
                        this
                            .PAGE_LOADING_INSECURE_CONTENT;
                }
            }

            if (state > 0)
                httpsOnlyStatus =
                    this.HTTPS_ONLY_EXCEPTION;
            else if (this.isHTTPSOnlyErrorPage) {
                httpsOnlyStatus =
                    this.HTTPS_ONLY_FAILED_PARENT;
            } else if (
                this.hasContentFailedHTTPSOnlyUpgrade
            ) {
                httpsOnlyStatus =
                    this.HTTPS_ONLY_FAILED_CHILD;
            } else if (this.hasContentHTTPSOnlyUpgrade) {
                httpsOnlyStatus =
                    this.HTTPS_ONLY_UPGRADED;
            }
        }

        const data: any = {
            connection,
            cipherStrength,
            isPrivateWindow,
            httpsOnlyStatus,
            customRoot: this.hasCustomCertificate
        };

        if (this.securityInfo.secInfo) {
            let ca = {
                supplemental: "",
                verifiedBy: "",
                host: this.identityHost,
                owner: ""
            };

            const certInfo =
                this.securityInfo.secInfo.serverCert;

            if (this.isSecureConnection) {
                if (!this.hasUserCertOverrideGesture) {
                    ca.verifiedBy =
                        certInfo.issuerOrganization;
                } else {
                    ca.verifiedBy = `You`;
                }
            }

            if (this.hasEVCertificate) {
                ca.owner = certInfo.organization;

                const data = this.getCertData();

                if (data.city)
                    ca.supplemental += `${data.city}\n`;
                if (data.state && data.country) {
                    ca.supplemental += `${data.state}, ${data.country}`;
                } else if (data.state) {
                    ca.supplemental += data.state;
                } else if (data.country) {
                    ca.supplemental += data.country;
                }
            }

            data.ca = ca;
        }

        return data;
    }

    constructor(tab: Tab) {
        this.tab = tab;
    }
}

export default IdentityManager;
