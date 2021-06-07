/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class PoliciesComponent {
    constructor() {
        console.log("[Policies] Loaded policies service.");
    }

    init() {
        banners.create(
            `Your browser's settings are being managed by your organisation.`,
            `work`
        );
    }
}

const policies = new PoliciesComponent();