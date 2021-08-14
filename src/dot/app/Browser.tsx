/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import { Chrome } from "../components/Chrome";
import { useBrowserSelector } from "./store/hooks";

export const Browser = () => {
    const ui = useBrowserSelector((s: any) => s.ui)

    return <Chrome />;
};