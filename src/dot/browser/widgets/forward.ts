/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Widget } from "browser/customisable/decorators";
import CustomisableUIItem from "browser/customisable/item";
import { kForwardIcon } from "icons";

@Widget("button", {
    id: "forward-button",

    label: "forward-button",
    tooltip: "forward-button-tooltip",

    showLabelByDefault: false,

    icon: kForwardIcon
})
class ForwardButtonWidget extends CustomisableUIItem {}

export default ForwardButtonWidget;
