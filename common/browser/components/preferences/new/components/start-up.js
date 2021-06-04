/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class StartupComponent {
    _service = null;
    _isDefault = false;

    _template() {
        return document.getElementById("template-start-up").content.cloneNode(true)
    }

    constructor() {
        console.log("[Startup] Loaded start-up service.");
    }

    init() {
        this.render();
    }

    getShellService() {
        return windowRoot.ownerGlobal.getShellService();
    }

    setDefaultBrowser() {
        try {
            if (AppConstants.HAVE_SHELL_SERVICE) {
                let shellSvc = this.getShellService();

                if (!shellSvc) return;

                shellSvc.setAsDefault();

                this.checkDefaultBrowser();
            }
        } catch (ex) {
            console.error(ex);
            return;
        }
    }

    checkDefaultBrowser() {
        const isDefault = this.getShellService().isDefaultBrowser();

        // avoid rerenders every time we check
        if (isDefault == this._isDefault) return;

        this._isDefault = isDefault;

        let setDefaultBtnEl = document.getElementById("set-default-btn");
        let setDefaultBodyEl = document.getElementById("set-default-body");

        if (isDefault) {
            setDefaultBtnEl.setAttribute("disabled", "true");
            setDefaultBodyEl.innerText = `Dot Browser is your default browser.`
        } else {
            setDefaultBtnEl.removeAttribute("disabled");
            setDefaultBodyEl.innerText = `Dot Browser is not your default browser.`
        }

        return isDefault;
    }

    render() {
        const template = this._template();

        let startupEl = document.getElementById("start-up");
        startupEl.appendChild(template);

        let setDefaultBtnEl = document.getElementById("set-default-btn");
        setDefaultBtnEl.addEventListener("click", () => this.setDefaultBrowser())
    }
}

const startup = new StartupComponent();