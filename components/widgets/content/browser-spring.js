/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserSpring extends MozHTMLElement {
    _customising = false;

    /**
     * Determines the current customising state for the spring
     */
    get customising() {
        return this._customising;
    }

    set customising(val) {
        this.toggleAttribute("customising", val);
        this._customising = val;

        if (!val) {
            this.textContent = "";
            this.removeAttribute("title");
        } else {
            this.updateLabel();
        }
    }

    _startX = 0;
    _startWidth = 0;

    canResize = false;

    _previousWidth = 0;

    get grip() {
        const val = parseFloat(this.style.getPropertyValue("--spring-grip"));
        return isNaN(val) ? (this.getBoundingClientRect().width + 4) : val;
    }

    updateLabel() {
        if (this.grip && this.grip <= this.getBoundingClientRect().width + 3) {
            const { width } = this.getBoundingClientRect();

            this.textContent = width.toFixed(0);
            this.style.fontSize = Math.min(width / 3, 14) + "px";
        } else if (this.getBoundingClientRect().width >= 20) {
            this.textContent = "Auto";
        }

        this.setAttribute("title", this.textContent);
    }

    /**
     * Handles mouse movements when resizing springs
     * @param {MouseEvent} event 
     */
    onMouseMove(event) {
        if (!this.customising || !this.canResize) return;

        const newWidth = this._startWidth + event.clientX - this._startX;

        if (newWidth <= 10 || this.grip >= this.getBoundingClientRect().width + 6) return;

        this.style.setProperty("--spring-grip", (newWidth.toFixed(0)) + "px");

        this.updateLabel();

        document.documentElement.classList.add("auxiliary-resizing");
    }

    /**
     * Handles incoming events to the element
     * @param {Event} event 
     */
    handleEvent(event) {
        switch (event.type) {
            case "keydown":
            case "keyup":
                this.customising = /** @type {KeyboardEvent} */ (event).ctrlKey;
                document.documentElement.classList.remove("auxiliary-resizing");
                if (this.canResize) {
                    this.canResize = false;
                }
                break;
            case "mousedown":
                this._startWidth = this.getBoundingClientRect().width;
                this._startX = /** @type {MouseEvent} */ (event).clientX;
                this.canResize = true;
                break;
            case "mousemove":
                this.onMouseMove(/** @type {MouseEvent} */(event));
                break;
            case "mouseup":
                document.documentElement.classList.remove("auxiliary-resizing");
                this.canResize = false;
                break;
        }
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        document.addEventListener("keydown", this);
        document.addEventListener("keyup", this);
        this.addEventListener("mousedown", this);
        document.addEventListener("mousemove", this);
        document.addEventListener("mouseup", this);
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;
    }
}

customElements.define("browser-spring", BrowserSpring);