/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BrowserCustomisableUI from "browser/customisable";
import BrowserExtensions from "browser/extensions";
import BrowserInit from "browser/init";
import BrowserMotion from "browser/motion";
import BrowserPreferences from "browser/preferences";
import BrowserStorage from "browser/storage";
import BrowserTabs from "browser/tabs";
import BrowserThemes from "browser/themes";
import BrowserUtilities from "browser/utilities";
import BrowserWindow from "browser/window";
import "l10n";
import { BrowserToolboxLauncher, Ci } from "mozilla";
import "themes/browser.scss";
import "themes/tab.scss";
import "themes/titlebar.scss";
import "themes/toolbar.scss";
import { Events } from "./events";
import { exportPublic } from "./shared/globals";

export class Browser extends Events {
    public customisable = new BrowserCustomisableUI(this);
    public extensions = new BrowserExtensions(this);
    public init = new BrowserInit(this);
    public motion = new BrowserMotion(this);
    public preferences = new BrowserPreferences(this);
    public storage = new BrowserStorage(this);
    public tabs = new BrowserTabs(this);
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

    public constructor() {
        super();

        this.load();
    }

    public async load() {
        /*
            Initialise vital services.
        */
        await this.storage.init();
        await this.customisable.init();
        
        // Unlock the browser error handling.
        // All errors can be treated as warnings.
        window.windowReady = true;
        this.window.visible = true;

        BrowserToolboxLauncher.init();

        this.themes.load();
        // this.tabs.createInitialTab();
    }
}

const dot = new Browser();

export default dot;
exportPublic("dot", dot);