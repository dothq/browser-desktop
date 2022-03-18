/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { PureComponent } from "react";
import NativeWindowDecorations from "../csd/WindowDecorations.native";
import Customisable from "../customise/target";
import { StyledTabBar, TabsContainer } from "./TabBar.style";

class TabBar extends PureComponent {
	public render() {
		return (
			<StyledTabBar id={"tabbar"}>
				<NativeWindowDecorations side={"left"} />

				<TabsContainer>
					<Customisable id={"tabbar"} type={"horizontal"} />
				</TabsContainer>

				<NativeWindowDecorations side={"right"} />
			</StyledTabBar>
		);
	}
}

export default TabBar;
