/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BannersComponent {
    _template(text, icon) {
        return `
            <div class="preferences-banner">
                <i class="${icon}-icon"></i>
                <span>${text}</span>
            </div>
        `
    }

    constructor() {
        console.log("[Banner] Loaded banner service.");
    }

    create(options) {
        const template = this._template(options.text, options.icon);

        const banners = document.getElementById("preferences-banners");
        const banner = document.createElement("div");
        banner.innerHTML = template;
        banners.appendChild(banner);
    }
}

const banners = new BannersComponent();