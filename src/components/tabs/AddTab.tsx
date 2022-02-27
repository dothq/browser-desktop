/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { PureComponent } from "react";
import styled from "styled-components";
import ToolbarButton from "../common/button/toolbar";

const StyledAddTab = styled(ToolbarButton)`
	margin-inline-start: 0.12rem;
`;

class AddTab extends PureComponent {
	public render() {
		return <StyledAddTab icon={"add.svg"} />;
	}
}

export default AddTab;
