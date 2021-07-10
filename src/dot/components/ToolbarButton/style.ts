/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled, { css } from "styled-components";

export const ToolbarButtonEnclave = styled.button`
    appearance: none;
    padding: 6px;
    border-radius: 6px;
    color: currentColor;
    border: none;
    display: flex;

    ${({ hasImage, noHover, disabled }: { hasImage: boolean; noHover: boolean; disabled?: boolean }) => css`
        background-color: ${hasImage ? `transparent` : `var(--button)`};

        opacity: ${disabled ? 0.5 : 1};
        pointer-events: ${disabled ? "none" : ""};

        ${!noHover ? `
            &:focus-visible {
                outline: 2px solid #00DDFF;
            }

            &:hover {
                background-color: var(--button-hover);
            }
        
            &:active {
                background-color: var(--button-active);
            }
        ` : ``};
    `};
`;

export const ToolbarButtonIcon = styled.image`
    ${({ icon }: { icon?: string | { src: any, size: number, colour: string } }) => css`
        display: ${icon ? "" : "none"};

        mask-image: url(${typeof(icon) == "object" ? icon.src : icon});
        mask-size: cover;
        mask-repeat: no-repeat;
        mask-position: center;
        background-color: ${typeof(icon) == "object"
            ? icon.colour
            : "var(--toolbarbutton-icon-fill)"
        };

        width: ${typeof(icon) == "object" ? icon.size : 16}px;
        height: ${typeof(icon) == "object" ? icon.size : 16}px;
    `};
`;

export const ToolbarButtonLabel = styled.label`

`;