/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { L10nProvider } from "../l10n";
import { Browser } from "./Browser";
import { store } from "./store";

render(
    <Provider store={store}>
        <L10nProvider>
            <Browser />
        </L10nProvider>
    </Provider>,
    document.getElementById("browser")
);
