/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { PureComponent } from "react";
import {
	CSDContainer,
	StyledCSD,
	StyledCSDButton,
} from "./WindowDecorations.native.style";

interface Props {
	side: "left" | "right";
}

class NativeWindowDecorations extends PureComponent<Props> {
	public render() {
		return (
			<StyledCSD side={this.props.side}>
				<CSDContainer>
					<StyledCSDButton variant={"minimize"} />
				</CSDContainer>
				<CSDContainer>
					<StyledCSDButton variant={"maximize"} />
				</CSDContainer>
				<CSDContainer>
					<StyledCSDButton variant={"restore"} />
				</CSDContainer>
				<CSDContainer>
					<StyledCSDButton variant={"close"} />
				</CSDContainer>
			</StyledCSD>
		);
	}
}

export default NativeWindowDecorations;
