/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled, { css } from "styled-components";
import { TBDisplayMode } from ".";

export const StyledToolbarButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;

	appearance: none;
	border: none;
	background-color: transparent;

	-moz-context-properties: fill;
	fill: rgba(0, 0, 0, 0.75); // @todo add themes

	${({
		w,
		h,
		roundness,
		displayMode,
		disabled,
	}: {
		w?: string | number;
		h?: string | number;
		roundness?: number;
		displayMode?: TBDisplayMode;
		disabled?: boolean;
	}) => css`
		${disabled
			? `
                opacity: 0.3;
            `
			: `
                &:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }

                &:hover:active {
                    background-color: rgba(0, 0, 0, 0.2);
                }
        `}

		${displayMode == TBDisplayMode.Icon
			? `
                width: ${
					w
						? typeof w == "string"
							? w
							: `${w}px`
						: "2.4rem"
				};
                height: ${
					w
						? typeof w == "string"
							? w
							: `${w}px`
						: "2.4rem"
				};
            `
			: `
                width: ${
					w
						? typeof w == "string"
							? w
							: `${w}px`
						: "2.4rem"
				};
                height: ${
					h
						? typeof h == "string"
							? h
							: `${h}px`
						: "2.4rem"
				};
            `}

		border-radius: ${roundness || 6}px;

		padding-inline: ${displayMode == TBDisplayMode.IconAndText
			? `0.75rem`
			: displayMode == TBDisplayMode.Icon
			? `0`
			: `0.5rem`};
	`}
`;
