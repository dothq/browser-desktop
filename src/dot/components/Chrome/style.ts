/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from "styled-components";

export const NavigatorToolbox = styled.div.attrs(() => { 
    "navigator-toolbox" 
})`
    display: flex;
    width: 100%;
    flex-direction: column;
    border-bottom: 1px solid var(--chrome-content-separator-color);
`;

export const Navbar = styled.nav`
    display: flex;
    -moz-window-dragging: drag;
    background-color: var(--toolbar-bgcolor);
    color: var(--toolbar-color);
    position: relative;
    height: 40px;
    justify-content: space-between;
`;

export const NavbarContainer = styled.div`
    display: flex;
    padding: 6px;
    gap: 2px;
    flex: 1;
`;

export const Tabbar = styled.nav`
    height: 40px;
    background-color: var(--lwt-accent-color);
`;