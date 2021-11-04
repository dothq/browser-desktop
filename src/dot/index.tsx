/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { configure } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";
import { Chrome } from "./components/Chrome";
import { Statusbar } from "./core/statusbar";

configure({
    enforceActions: "never"
});

export const Application = observer(() => {
    return (
        <div className={"ui-container"}>
            <Chrome />
            {/* <Launcher /> */}
            <Statusbar />
        </div>
    );
});

export const render = () =>
    ReactDOM.render(
        <Application />,
        document.getElementById("browser")
    );
