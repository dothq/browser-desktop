/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
    attr,
    createRef,
    css,
    div,
    getDOMNode,
    i,
    OikiaElement,
    RefObject,
    render,
    span
} from "oikia";
import { Events } from "../events";
import { kHomeFilledIcon } from "../icons";
import { Delegate, makeReactive, R } from "../oikia";
import { exportPublic } from "../shared/globals";
import { TabAnimations } from "./animation";
// import { TabUtils } from "./utils";

class Tab extends Events {
    /**
    * Tab ID
    */
    public id: number = 0;

    /**
    * The position of the tab in the list
    */
    public get index() {
        return 0;
    }

    /**
     * Current title for Tab
    */
    @R(({ _, value }) => {
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
    @R(({ _, value }) => css(_.ref.tabIcon.current,
        "backgroundImage",
        value
    ))
    public icon: string = kHomeFilledIcon;

    /**
     * Determines if the Tab is active or not
    */
    @R(({ _, value }) => attr(_.ref.tab.current, 
        "dataActive", 
        value
    ))
    public active: boolean = false;

    /**
    * HTML reference to Tab
    */
    public get linkedTab() {
        return this.ref.tab.current;
    }

    /**
    * Animation controller for Tab
    */
    public animation: TabAnimations;

    /**
    * Oikia references
    */
    public ref: Record<string, RefObject<OikiaElement>> = {};

    public constructor() {
        super();

        // Required to mark @R decorated props as reactive
        makeReactive(this);

        const component = this.render();

        // Append to #tabs-mount
        render(
            component,
            getDOMNode("#tabs-mount")
        );

        // Run the open animation
        this.animation = new TabAnimations(this);
        this.animation.open.play()
            .then(_ => this.emit("TabAnimationEnd"));
        
        // Make the tab active
        this.active = true;
    }

    /**
    * Renders the Tab
    */
    private render() {
        this.ref.tab = createRef<HTMLDivElement>();
        this.ref.tabIcon = createRef<HTMLElement>();
        this.ref.tabTitle = createRef<HTMLSpanElement>();
        this.ref.tabActions = createRef<HTMLDivElement>();
        
        return (
            div({ 
                class: "tabbrowser-tab", 
                ref: this.ref.tab
            },
                div({ class: "tab-content" },
                    i({ 
                        class: "tab-icon", 
                        ref: this.ref.tabIcon,
                        style: {
                            backgroundImage: this.icon
                        }
                    }),
                    span({ class: "tab-title", ref: this.ref.tabTitle },
                        this.title
                    ),
                    div({ class: "tab-actions", ref: this.ref.tabActions }
                        
                    )
                )
            )
        )
    }
}

export default Tab;
exportPublic("Tab", Tab);