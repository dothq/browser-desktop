/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request, sender, sendResponse)
});

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
})

const main = async () => {
    const getTheme = async () => {
        const theme = await browser.theme.getCurrent();

        document.getElementById("theme").innerHTML = JSON.stringify(theme);
    }

    setInterval(async () => {
        await getTheme();
    }, 1000);

    await getTheme();
}

// I don't see why this is necessary any more. This file will
// run every time you open the popup, so these listeners are
// unnecessary
// browser.tabs.onUpdated.addListener(main);
// browser.tabs.onActivated.addListener(main);

main()