/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { PureComponent } from "react";
import Addressbar from "../addressbar/Addressbar";
import ToolbarButton from "../common/button/toolbar";
import Spacer from "../common/spacer";
import { StyledNavBar } from "./NavBar.style";

class NavBar extends PureComponent {
	public render() {
		return (
			<StyledNavBar id={"navbar"}>
				<ToolbarButton icon={"back.svg"} />
				<ToolbarButton icon={"forward.svg"} disabled />
				<ToolbarButton icon={"reload.svg"} />
				<Spacer />
				<Addressbar />
				<Spacer />
				<ToolbarButton icon={"download.svg"} />
				<ToolbarButton
					roundness={999}
					icon={"https://github.com/EnderDev.png"}
					iconSize={22}
					iconRoundness={999}
				/>
				<ToolbarButton icon={"more.svg"} />
			</StyledNavBar>
		);
	}
}

export default NavBar;
