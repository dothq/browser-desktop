/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { PureComponent } from "react";
import TabClose from "./components/Close";
import TabFavicon from "./components/Favicon";
import TabTitle from "./components/Title";
import { StyledTab, TabContainer, TabContent } from "./Tab.style";

class Tab extends PureComponent {
	public render() {
		return (
			<StyledTab>
				<TabContainer>
					<TabContent>
						<TabFavicon />
						<TabTitle />
					</TabContent>

					<TabClose />
				</TabContainer>
			</StyledTab>
		);
	}
}

export default Tab;
