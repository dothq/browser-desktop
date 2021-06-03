/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class SearchBoxComponent {
    _searchBoxEl = null
    _previousTabBeforeKey = null

    constructor() {
        this._service = Cc["@mozilla.org/toolkit/profile-service;1"].getService(
            Ci.nsIToolkitProfileService
        );

        console.log("[Profiles] Loaded start-up service.");
    }

    onFocus() {
        if (this._searchBoxEl.value.length == 0 || !this._previousTabBeforeKey) {
            this._previousTabBeforeKey = selectedTab;
            console.log(this._previousTabBeforeKey)
        }
    }

    onKeyUp(event) {
        goto(`not-found`);
    }

    onBlur() {
        if (this._searchBoxEl.value.length == 0) {
            goto(this._previousTabBeforeKey)
        };
    }

    init() {
        this._searchBoxEl = document.getElementById("search-textbox");

        this._searchBoxEl.addEventListener("keyup", () => this.onKeyUp());
        this._searchBoxEl.addEventListener("blur", () => this.onBlur());
        this._searchBoxEl.addEventListener("focus", () => this.onFocus());
    }
}

const searchbox = new SearchBoxComponent();