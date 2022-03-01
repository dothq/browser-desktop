/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Box from "browser/components/common/box";
import styled, { css } from "styled-components";

export const StyledCSD = styled(Box)`
	display: flex;
	-moz-default-appearance: -moz-window-button-box;
	appearance: auto;

	@media not (-moz-gtk-csd-available) {
		display: none;
	}

	${({ side }: { side: string }) => css`
		flex-direction: ${side == "left" ? `row-reverse` : `row`};

		@media (-moz-gtk-csd-reversed-placement) {
			display: ${side == "left" ? "" : "none"};
		}
	`};
`;

export const CSDContainer = styled(Box)`
	position: relative;
`;

export const StyledCSDButton = styled(Box)`
	appearance: auto;
	-moz-box-align: center;
	-moz-box-pack: center;
	display: -moz-box;

	${({ variant }: { variant: string }) => css`
		@media (-moz-gtk-csd-available) {
			@media not (-moz-gtk-csd-${variant}-button) {
				display: none;
			}
		}

		-moz-default-appearance: -moz-window-button-${variant};
		-moz-box-ordinal-group: env(
			-moz-gtk-csd-${variant}-button-position
		);
	`};
`;
