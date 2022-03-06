/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const GlobalStyle = `
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    html,
    body {
        font: message-box;
        user-select: none;
    }

    #app {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: rgb(242, 242, 244); // @todo add themes
    }

    *:focus-visible {
        outline: 2px solid #0069e0;
    }
`;
