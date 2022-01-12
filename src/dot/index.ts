/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BrowserExtensions from "browser/extensions";
import BrowserInit from "browser/init";
import BrowserMotion from "browser/motion";
import BrowserPreferences from "browser/preferences";
import BrowserTabs from "browser/tabs";
import BrowserThemes from "browser/themes";
import BrowserTitlebar from "browser/titlebar";
import BrowserUtilities from "browser/utilities";
import BrowserWindow from "browser/window";
import "l10n";
import { BrowserToolboxLauncher, Ci } from "mozilla";
import {
    aside,
    createRef,
    div,
    getDOMNode,
    RefObject,
    render,
    _
} from "oikia";
import "themes/browser.scss";
import { Events } from "./events";
import { exportPublic } from "./shared/globals";

export class Browser extends Events {
    public extensions = new BrowserExtensions(this);
    public init = new BrowserInit(this);
    public motion = new BrowserMotion(this);
    public preferences = new BrowserPreferences(this);
    public tabs = new BrowserTabs(this);
    public titlebar = new BrowserTitlebar(this);
    public themes = new BrowserThemes(this);
    public utilities = new BrowserUtilities(this);
    public window = new BrowserWindow(this);

    /**
     * Determines if the browser is a multi-process browser
    */
    public isMultiProcess = window.docShell.QueryInterface(Ci.nsILoadContext)
        .useRemoteTabs;

    /**
     * Determines if the browser is running in Fission mode
    */
    public isFission = window.docShell.QueryInterface(Ci.nsILoadContext)
        .useRemoteSubframes;

    /**
     * HTML reference to the Titlebar
    */
    public titlebarRef: RefObject<HTMLDivElement> | undefined;

    /**
     * HTML reference to the Toolbar
    */
    public toolbarRef: RefObject<HTMLDivElement> | undefined;

    /**
     * HTML reference to the Bookmarks Bar
    */
    public bookmarksBarRef: RefObject<HTMLDivElement> | undefined;

    /**
     * HTML reference to the Browser Contents
    */
    public contentRef: RefObject<HTMLDivElement> | undefined;

    public constructor() {
        super();

        const component = this.render();
        render(component, getDOMNode("#browser"));
        
        this.window.visible = true;

        BrowserToolboxLauncher.init();
        
        window.addEventListener("DOMContentLoaded", () => {
            this.tabs.createInitialTab();
        })
    }

    public render() {
        this.titlebarRef = createRef<HTMLDivElement>();
        this.toolbarRef = createRef<HTMLDivElement>();
        this.bookmarksBarRef = createRef<HTMLDivElement>();
        this.contentRef = createRef<HTMLDivElement>();

        const Titlebar = this.titlebar.render(this.titlebarRef);

        return _(
            Titlebar,
            div({
                id: "browser-toolbar",
                ref: this.toolbarRef
            }),
            div({
                id: "browser-bookmarkbar",
                ref: this.bookmarksBarRef
            }),
            div(
                {
                    id: "browser-content",
                    ref: this.contentRef
                },
                aside({ id: "browser-content-sidebar" }),
                div({ id: "browser-content-tabbox" })
            )
        );
    }
}

const dot = new Browser();

export default dot;
exportPublic("dot", dot);