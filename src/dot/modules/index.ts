/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { exportPublic } from "../shared/globals";

export const ChromeUtils = {
    ...window.ChromeUtils,
    defineModuleGetter(owner: any, moduleName: string, moduleUri: string) {
        const mod = window.ChromeUtils.import(moduleUri)[moduleName];
        owner[moduleName] = mod;

        return { [moduleName]: mod };
    }
};

const include = (moduleUri: string) => {
    const moduleName = moduleUri.split("/")[moduleUri.split("/").length-1].split(".")[0];

    const mod = ChromeUtils.import(moduleUri);
    const data = mod[moduleName];

    exportPublic(
        moduleName,
        data
    )

    return mod;
}

/*
    Only core modules should be added here.

    Core modules will be available in the Browser Toolbox by calling the module
    name in the console.

    Import your modules lazily in the app using ChromeUtils.import() if needed.
*/
export const { Services } = include("resource://gre/modules/Services.jsm");
export const { AppConstants } = include("resource://gre/modules/AppConstants.jsm");

export const Ci = (window as any).Ci;
export const Cc = (window as any).Cc;

export const { LightweightThemeConsumer } = include(
    "resource://gre/modules/LightweightThemeConsumer.jsm"
);
export const { E10SUtils } = include("resource://gre/modules/E10SUtils.jsm");
export const { ActorManagerParent } = include("resource://gre/modules/ActorManagerParent.jsm");
export const { AddonManager } = include("resource://gre/modules/AddonManager.jsm");