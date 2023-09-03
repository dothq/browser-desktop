/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

declare const gBrowserInit: any;
declare const dump: (message: string) => void;
declare const require: <T = any>(moduleURI: string) => T;

declare module "resource://*";
