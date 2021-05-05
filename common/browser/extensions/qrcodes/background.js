/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const main = async () => {
    const getTheme = async () => {
        const theme = await browser.theme.getCurrent();

        document.getElementById("theme").innerHTML = JSON.stringify(theme);
    }

    setInterval(async () => {
        await getTheme();
    }, 1000);
}

browser.tabs.onUpdated.addListener(main);
browser.tabs.onActivated.addListener(main);