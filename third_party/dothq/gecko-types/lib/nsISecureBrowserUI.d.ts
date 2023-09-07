/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsITransportSecurityInfo } from "./nsITransportSecurityInfo";

export interface nsISecureBrowserUI {
    readonly state: number;
    readonly isSecureContext: boolean;
    readonly secInfo: nsITransportSecurityInfo;
}