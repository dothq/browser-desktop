/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import { Chrome } from "../components/Chrome";
import { Launcher } from "../core/launcher";
import { Statusbar } from "../core/statusbar";
import { useBrowserSelector } from "./store/hooks";

export const Browser = () => {
    const ui = useBrowserSelector((s: any) => s.ui)

    return (
        <div className={"ui-container"}>
            <Chrome />
            <Launcher />
            <Statusbar />
        </div>
    );
};