/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from "styled-components";
import Box from "../common/box";

export const StyledAddressbar = styled(Box)`
	display: flex;
	align-items: center;

	width: 800px;
	height: 36px;

	position: relative;

	border-radius: 8px;

	padding: 2px;
	gap: 0.2rem;
`;

export const AddressbarBackground = styled(Box)`
	width: 100%;
	height: 100%;

	top: 0;
	left: 0;
	z-index: 0;

	position: absolute;

	background-color: rgb(242, 242, 244);

	border-radius: 8px;
`;
