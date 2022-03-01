/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Icon from "browser/components/common/icon";
import React, { PureComponent } from "react";
import { StyledFavicon } from "./Favicon.style";

class TabFavicon extends PureComponent {
	public render() {
		return (
			<StyledFavicon>
				<Icon
					size={16}
					icon={"chrome://branding/content/icon64.png"}
				/>
			</StyledFavicon>
		);
	}
}

export default TabFavicon;
