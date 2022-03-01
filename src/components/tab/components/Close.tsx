/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ToolbarButton from "browser/components/common/button/toolbar";
import React, { PureComponent } from "react";

class TabClose extends PureComponent {
	public render() {
		return (
			<ToolbarButton
				w={"1.5rem"}
				icon={"close.svg"}
				iconSize={10}
				roundness={4}
			/>
		);
	}
}

export default TabClose;
