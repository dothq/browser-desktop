/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from "styled-components";
import Box from "../common/box";

export const StyledTab = styled(Box)`
	display: flex;

	width: 250px;
	height: 100%;

	background-color: white; // @todo add themes
	-moz-window-dragging: no-drag;

	border-radius: 6px 6px 0 0;
	margin-inline-end: 0.15rem;
`;

export const TabContainer = styled(Box)`
	display: flex;
	align-items: center;
	justify-content: space-between;

	width: 100%;
	height: 100%;

	margin-inline-end: 0.5rem;
`;

export const TabContent = styled(Box)`
	display: flex;
	align-items: center;

	height: 100%;

	gap: 0.7rem;
`;
