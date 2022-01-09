/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BrowserExtensions from "browser/extensions";
import BrowserPreferences from "browser/preferences";
import BrowserTabs from "browser/tabs";
import BrowserThemes from "browser/themes";
import BrowserUtilities from "browser/utilities";
import BrowserWindow from "browser/window";
import { BrowserToolboxLauncher } from "mozilla";
import {
    aside,
    createRef,
    div,
    getDOMNode,
    RefObject,
    render,
    _
} from "oikia";
import { Events } from "./events";
import "./l10n";
import { exportPublic } from "./shared/globals";
import "./themes/browser.scss";

export class Browser extends Events {
    public extensions = new BrowserExtensions(this);
    public preferences = new BrowserPreferences(this);
    public tabs = new BrowserTabs(this);
    public themes = new BrowserThemes(this);
    public utilities = new BrowserUtilities(this);
    public window = new BrowserWindow(this);

    public ref: Map<string, RefObject<HTMLElement>> =
        new Map();

    public constructor() {
        super();

        const component = this.render();

        render(component, getDOMNode("#browser"));

        BrowserToolboxLauncher.init();

        this.window.visible = true;
    }

    public render() {
        this.ref.set(
            "titlebar",
            createRef<HTMLDivElement>()
        );
        this.ref.set(
            "toolbar",
            createRef<HTMLDivElement>()
        );
        this.ref.set(
            "bookmarkbar",
            createRef<HTMLDivElement>()
        );
        this.ref.set(
            "content",
            createRef<HTMLDivElement>()
        );

        return _(
            div({
                id: "browser-titlebar",
                ref: this.ref.get("titlebar")
            }),
            div({
                id: "browser-toolbar",
                ref: this.ref.get("toolbar")
            }),
            div({
                id: "browser-bookmarkbar",
                ref: this.ref.get("bookmarkbar")
            }),
            div(
                {
                    id: "browser-content",
                    ref: this.ref.get("content")
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
