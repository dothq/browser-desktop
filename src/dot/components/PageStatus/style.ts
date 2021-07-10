import styled, { css } from "styled-components";

export const StyledPageStatus = styled.div`
    width: max-content;
    height: 20px;
    background-color: var(--lwt-accent-color);
    padding-left: 0 12px;
    position: absolute;
    user-select: none;
    color: var(--lwt-text-color);
    display: flex;

    ${({ side }: { side: string }) => css`
        ${side}: 0;
        bottom: 0;
    `};
`;