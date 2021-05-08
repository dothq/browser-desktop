/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

window.addEventListener("contextmenu", (e) => {
    if (e.target.nodeName == "INPUT") return;

    e.preventDefault();
    e.stopPropagation();
})

// https://stackoverflow.com/a/65620774/10560157
const throttle = (func, limit) => {
    let lastFunc;
    let lastRan = Date.now() - (limit + 1); // enforces a negative value on first run
    return function (...args) {
        const context = this;
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
            func.apply(context, args);
            lastRan = Date.now();
        }, limit - (Date.now() - lastRan)); // negative values execute immediately
    }
}

const getTheme = async () => {
    const theme = await browser.theme.getCurrent();

    for (const [key, value] of Object.entries(theme.colors)) {
        document.body.style.setProperty(
            "--theme-" + key.replace(/_/g, "-"),
            value
        )
    }
}

const getCurrentTab = async () => {
    const tab = await browser.tabs.query({ currentWindow: true, active: true });

    return tab[0];
}

const parseHostname = (url) => {
    const { hostname } = new URL(url);

    return hostname.length == 0 ? url : hostname
}

const showQrCodeRenderingError = (id) => {
    document.getElementById("qr-codes-canvas").style.backgroundImage = "";

    const errorEl = document.getElementById("qr-codes-error");

    document.l10n.setAttributes(errorEl, `qr-codes-error-${id}`);

    errorEl.style.display = "";
}

const renderQrCode = (url) => {
    document.getElementById("qr-codes-error").style.display = "none";

    if (url.length > 256) return showQrCodeRenderingError("too-long");
    if (url.length == 0) return showQrCodeRenderingError("too-short");

    const qr = new AwesomeQR.AwesomeQR({
        text: url,
        size: 500,
        colorLight: "white",
        colorDark: "darkgray",
        autoColor: false,
        backgroundDimming: "transparent",
        components: {
            data: {
                scale: 1,
            },
            timing: {
                scale: 1,
                protectors: true,
            },
            alignment: {
                scale: 1,
                protectors: true,
            },
            cornerAlignment: {
                scale: 1,
                protectors: true,
            },
        }
    })

    qr.draw().then(dataUrl => {
        document.getElementById("qr-codes-canvas").style.backgroundImage = `url(${dataUrl})`;
    })
}

const main = async () => {
    await getTheme();

    const { url } = await getCurrentTab();

    const input = document.getElementById("qr-codes-input");
    input.value = url;

    const hostname = parseHostname(url);
    document.l10n.setAttributes(
        document.getElementById("popup-title"),
        "qr-codes-title",
        {
            hostname
        }
    );

    renderQrCode(input.value);
}

browser.tabs.onUpdated.addListener(async () => {
    await getTheme();
    main();
});

browser.tabs.onActivated.addListener(async () => {
    await getTheme();
    main();
});

browser.theme.onUpdated.addListener(async () => await getTheme());

window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("qr-codes-input");

    input.addEventListener("keyup", () => {
        throttle(renderQrCode(input.value), 500)
    })
})

main();