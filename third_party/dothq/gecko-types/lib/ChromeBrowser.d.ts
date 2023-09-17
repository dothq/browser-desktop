/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozXULElement } from "types";
import { BrowserTab } from "./BrowserTab";
import { BrowsingContext } from "./BrowsingContext";
import { nsIWebProgress } from "./nsIWebProgress";
import { nsIDocShell } from "./nsIDocShell";
import { nsIWebNavigation } from "./nsIWebNavigation";
import { BrowserTabs } from "components/tabs/BrowserTabs.sys.mjs";
import { NavigationHelper } from "components/navigation/NavigationHelper.sys.mjs";
import { nsIURI } from "./nsIURI";

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

export interface ChromeBrowser extends XULElement, MozXULElement {
	browserId: number;
	browsingContext?: BrowsingContext;
	isArticle: boolean;
	sendMessageToActor: (
		actorMessage: string,
		args: any,
		actorName: string,
		scope?: any
	) => void;
    permanentKey: object;
    openWindowInfo: object;
	remoteType: string;
    webProgress: nsIWebProgress;
    webNavigation: nsIWebNavigation;
    isNavigating: boolean;
    docShell?: nsIDocShell;
    docShellIsActive: boolean;
    contentTitle: string;

    fixupAndLoadURIString: OmitFirstArg<typeof NavigationHelper.fixupAndLoadURIString>;
    loadURI: OmitFirstArg<typeof NavigationHelper.loadURI>;
    droppedLinkHandler: typeof BrowserTabs.prototype.onBrowserDroppedLink;

    createAboutBlankContentViewer(principal: any, partitionedPrincipal: any): void;

    preserveLayers(preserveLayers: boolean): void;

    currentURI: nsIURI;
    documentURI: nsIURI;

    contentDocument: Document;
    contentWindow: Window;

    canGoBack: boolean;
    canGoForward: boolean;

    goBack(requiresUserInteraction?: boolean): void;
    goForward(requiresUserInteraction?: boolean): void;

    reloadWithFlags(flags: number): void;
    stop(flags: number): void;

    contentPrincipal: any; // @todo: nsIPrincipal

    securityUI: BrowsingContext["secureBrowserUI"];

    mIconURL: string;

    destroy(): void;
}
