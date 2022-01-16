/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Widget } from "browser/customisable/decorators";
import CustomisableUIItem from "browser/customisable/item";
import { kReloadIcon } from "icons";

@Widget("button", {
    id: "reload-button",

    label: "reload-button",
    tooltip: "reload-button-tooltip",

    showLabelByDefault: false,
    
    icon: kReloadIcon
})
class ReloadButtonWidget extends CustomisableUIItem {}

export default ReloadButtonWidget;

