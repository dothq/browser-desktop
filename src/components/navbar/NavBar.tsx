/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { PureComponent } from "react";
import Customisable from "../customise/target";
import { StyledNavBar } from "./NavBar.style";

class NavBar extends PureComponent {
	public render() {
		return (
			<StyledNavBar id={"navbar"}>
				<Customisable id={"navbar"} type={"horizontal"} />
			</StyledNavBar>
		);
	}
}

export default NavBar;
