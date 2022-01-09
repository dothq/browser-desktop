/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Browser } from "index";
import { BrowserHandler, Ci } from "mozilla";

class BrowserInit {
    public get urlArguments() {
        const uri = window.arguments?.[0];

        if(!uri) return null;

        const defaultArgs = BrowserHandler.defaultArgs;

        if (uri !== defaultArgs) {
            if (uri instanceof Ci.nsIArray) {
                return Array.from(
                    uri.enumerate(Ci.nsISupportsString)
                ).map((arg: any) => arg.data);
            } else if (uri instanceof Ci.nsISupportsString) {
                return uri.data;
            }

            return uri;
        }

        return null;
    }

    public constructor(private browser: Browser) {}
}

export default BrowserInit;