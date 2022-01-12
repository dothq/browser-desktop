/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { kHomeFilledIcon } from "icons";
import dot from "index";
import { BrowserUIUtils } from "mozilla";
import {
    attr,
    createRef,
    css,
    div, getDOMNode, i,
    OikiaElement,
    RefObject, span
} from "oikia";
import { Delegate, makeReactive, R } from "oikia-extension";
import { exportPublic } from "shared/globals";
import { Events } from "../../events";
import "../../themes/tab.scss";
import { TabAnimations } from "./animation";

class Tab extends Events {
    /**
     * Tab ID
     */
    public id: number = 0;

    /**
     * The position of the tab in the list
     */
    public index: number = 0;

    /**
     * Current title for Tab
     */
    @R(({ _, value }) => {
        if(!_.rendered) return;
        _.ref.tabTitle.current.textContent = value;
    })
    @Delegate(
        "listener",
        "webContents.pagetitlechanged",
        () => {}
    )
    public title: string = "New Tab";

    /**
     * Favicon for Tab
     */
    @R(({ _, value }) => {
        if(!_.rendered) return;

        css(
            _.ref.tabIcon.current,
            "backgroundImage",
            value
        )
    })
    public icon: string = kHomeFilledIcon;

    /**
     * Determines if the Tab is active or not
     */
    @R(({ _, value }) => {
        if(!_.rendered) return;
        
        attr(_.ref.tab.current, "dataActive", value)
    })
    public active: boolean = false;

    /**
     * If the tab has been rendered
     */
    public rendered: boolean = false;

    /**
     * Determines if a tab is safe to close
    */
    public get isEmpty() {
        if (this.busy) return false;
  
        const browser = this.linkedBrowser;
        
        if(!browser) return true;

        if (!dot.utilities.isBlankPageURL(browser.currentURI.spec)) {
            return false;
        }
  
        if (!BrowserUIUtils.checkEmptyPageOrigin(browser)) {
            return false;
        }
  
        if (browser.canGoForward || browser.canGoBack) {
            return false;
        }
  
        return true;
    }

    /**
     * HTML reference to Tab
     */
    public get linkedTab() {
        return this.ref.tab.current;
    }

    /**
     * HTML reference to <browser>
     */
    public linkedBrowser: HTMLBrowserElement | undefined;

    /**
     * HTML reference to the browser container
     */
    public linkedPanel: HTMLDivElement | undefined;

    /**
     * Tab that opened this current tab
    */
    public openerTab: Tab;

    /**
     * User Context ID for tab to isolate tabs into containers
    */
    public userContextId: number;

    /**
     * Determines if the tab is pinned or not
    */
    public pinned: boolean;

    /**
     * Determines if the tab can render animations
    */
    public canAnimate: boolean | undefined = true;

    /**
     * Stores information about the stylesheets on a page
    */
    public permanentKey: any;

    /**
     * Temporary value for storing parameters before creating the browser
    */
    public browserParams: {
        uriIsAboutBlank: boolean,
        remoteType: any
    } | undefined;

    /**
     * Owner of current tab
    */
    public owner: Tab | undefined;

    /**
     * Animation controller for Tab
     */
    public animation: TabAnimations;

    /**
     * Determines if the tab is loading or not
    */
    public busy = false;

    /**
     * Determines if there is progress in the loading
    */
    public progress = false;

    /**
     * Determines if the tab is pending
    */
    public pending = false;

    /**
     * Determines if the tab has crashed
    */
    public crashed = false;

    /**
     * Whether audio is playing in the tab
    */
    public audible = false;

    /**
     * Whether audio is muted in the tab
    */
    public muted = false;

    /**
     * Timer until the tab is no longer audible after pausing
    */
    public soundPlayingRemovalTimer: number | undefined;

    /**
     * Oikia references
     */
    public ref: Record<string, RefObject<OikiaElement>> =
        {};

    public constructor({
        openerTab,
        userContextId,
        pinned,
        canAnimate
    }: {
        openerTab: Tab,
        userContextId: number,
        pinned?: boolean,
        canAnimate?: boolean
    }) {
        super();

        // Required to mark @R decorated props as reactive
        makeReactive(this);

        this.openerTab = openerTab;
        this.userContextId = userContextId;
        this.pinned = pinned || false;
        this.canAnimate = canAnimate;

        this.animation = new TabAnimations(this);
    }

    public init(childTab: any) {
        const component = this.render();
        const titlebar = getDOMNode("#browser-titlebar");

        titlebar.insertBefore(component, childTab);

        // Run the open animation
        this.animation = new TabAnimations(this);

        // Only run open animation if we are allowed to animate
        this.animation.open
            .play(this.canAnimate ? 0 : 200)
            .then((_) => this.emit("TabAnimationEnd"));

        // Make the tab active
        this.active = true;

        this.rendered = true;
    }

    /**
     * Renders the Tab
     */
    public render() {
        this.ref.tab = createRef<HTMLDivElement>();
        this.ref.tabIcon = createRef<HTMLElement>();
        this.ref.tabTitle = createRef<HTMLSpanElement>();
        this.ref.tabActions = createRef<HTMLDivElement>();

        return div(
            {
                class: "tabbrowser-tab",
                ref: this.ref.tab
            },
            div(
                { class: "tab-content" },
                i({
                    class: "tab-icon",
                    ref: this.ref.tabIcon,
                    style: {
                        backgroundImage: this.icon
                    }
                }),
                span(
                    {
                        class: "tab-title",
                        ref: this.ref.tabTitle
                    },
                    this.title
                ),
                div({
                    class: "tab-actions",
                    ref: this.ref.tabActions
                })
            )
        );
    }
}

export default Tab;
exportPublic("Tab", Tab);
