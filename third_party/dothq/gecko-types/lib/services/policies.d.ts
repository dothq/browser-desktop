/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIURI } from "../nsIURI";

export interface ServicesPolicies {
    isAllowed(feature: string): boolean;
    getActivePolicies(): { [key: string]: boolean };
    getSupportMenu(): any;
    getExtensionPolicy(extensionID: string): any;
    getExtensionSettings(extensionID: string): any;
    mayInstallAddon(addon: any): boolean;
    allowedInstallSource(uri: nsIURI): boolean;
    isExemptExecutableExtension(url: string, extension: string): boolean;
}