/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { PureComponent } from "react";
import Tab from "../tab/Tab";
import AddTab from "./AddTab";
import { TabsContainer } from "./Tabs.style";

class Tabs extends PureComponent {
	public render() {
		return (
			<TabsContainer>
				<Tab />
				<AddTab />
			</TabsContainer>
		);
	}
}

export default Tabs;
