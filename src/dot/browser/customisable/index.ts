/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BrowserTitlebar from "browser/titlebar";
import BackButtonWidget from "browser/widgets/back";
import ForwardButtonWidget from "browser/widgets/forward";
import ReloadButtonWidget from "browser/widgets/reload";
import { Browser } from "index";
import { ConsoleAPI } from "mozilla";
import { getDOMNode, render } from "oikia";
import CustomisableUIItem from "./item";
import CustomisableUITarget from "./target";

const DOT_MIGRATION_VERSION_PREF =
    "dot.migration.version";

class BrowserCustomisableUI {
    /**
     * Current interface iteration.
     *
     * Should be updated each time major changes
     * are made to widget positions or the layout
     * of the interface.
     */
    public uiVersion = 1;

    /**
     * Set on start-up from dot.migration.version
     */
    public currentUiVersion: number | undefined;

    public widgets: Map<string, CustomisableUIItem> =
        new Map();
    public targets: Map<string, CustomisableUITarget> =
        new Map();

    /**
     * This should only be updated once the uiVersion
     * has been incremented.
     */
    public defaultLayout = {
        titlebar: [
            BackButtonWidget,
            ForwardButtonWidget,
            ReloadButtonWidget
        ]
    };

    public console = new ConsoleAPI({
        prefix: "CustomisableUI"
    });

    public log = (...args: any) =>
        this.console.log(...args);
    public warn = (...args: any) =>
        this.console.warn(...args);

    public setMigrationVersion() {
        this.browser.preferences.unlock(
            DOT_MIGRATION_VERSION_PREF
        );

        const value = this.browser.preferences.get(
            DOT_MIGRATION_VERSION_PREF
        );

        if (value == undefined || isNaN(value)) {
            this.browser.preferences.set(
                DOT_MIGRATION_VERSION_PREF,
                this.uiVersion
            );

            this.currentUiVersion = this.uiVersion;
        } else {
            this.currentUiVersion = value;
        }

        this.browser.preferences.lock(
            DOT_MIGRATION_VERSION_PREF
        );
    }

    /**
     * Initialise the Customisable UI and render the application.
     */
    public async init() {
        this.setMigrationVersion();
        this.log(
            `Current UI version: ${this.currentUiVersion}`
        );

        this.targets.set(
            "titlebar",
            new BrowserTitlebar()
        );

        for (const [targetId, widgets] of Object.entries(
            this.defaultLayout
        )) {
            const target = this.targets.get(targetId);

            if (target) {
                const parent = target.render();

                for (const Widget of widgets) {
                    const widget = new Widget();

                    let child: HTMLElement | undefined;

                    switch (widget.type) {
                        case "button":
                            child =
                                widget.renderAsButton();
                            break;
                    }

                    if (child) parent.appendChild(child);
                }

                const appNode = getDOMNode("#browser");
                render(parent, appNode);
            } else {
                throw new Error(
                    `Target with ID '${targetId}' was not registered.`
                );
            }
        }
    }

    public constructor(private browser: Browser) {}
}

export default BrowserCustomisableUI;
