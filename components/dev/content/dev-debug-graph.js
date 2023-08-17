/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Utility function to convert bytes to a human-readable format
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
function formatBytes(bytes, decimals = 2, k = 1024) {
    if (!+bytes) return '0 MB'

    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['b', 'kB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Utility function to generate a hexadecimal string with a size
 * @param {number} size 
 * @returns {string}
 */
function hex(size) {
    return [...Array(size)]
        .map(() => Math.floor(Math.random() * 16)
            .toString(16))
        .join("");
}

class DeveloperDebugGraph extends MozHTMLElement {
    constructor() {
        super();
    }

    resizeObserver;

    /** @type {HTMLCanvasElement} */
    get canvas() {
        return this.querySelector("div > canvas");
    }

    get ctx() {
        return this.canvas.getContext("2d");
    }

    get axes() {
        return {
            x: this.querySelector(".graph-x-axis"),
            y: this.querySelector(".graph-y-axis"),
        }
    }

    x = 0
    max = 100

    get actualMax() {
        return parseInt(this.axes.y.querySelector("ul").firstChild.textContent);
    }

    get pointGap() {
        const timings = this.axes.x?.querySelector("ul");

        if (!timings) return 0;

        const zeroSeconds = /** @type {HTMLLIElement} */ (timings.lastChild);
        const tenSeconds = timings.children[timings.children.length - 2];

        const zeroSecondX = zeroSeconds.getBoundingClientRect().x - zeroSeconds.getBoundingClientRect().width;
        const tenSecondX = tenSeconds.getBoundingClientRect().x - tenSeconds.getBoundingClientRect().width;

        const diff = zeroSecondX - tenSecondX;
        const lowerBoundDiff = diff / 10; // gives us a single second

        return lowerBoundDiff;
    }

    /** @type {ResizeObserverCallback} */
    observeResize = (entries) => {
        const entry = entries[0];

        this.canvas.width = entry.contentRect.width;
        this.canvas.height = entry.contentRect.height;
    }

    paint() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const calcX = (point) => this.canvas.width - (point * this.pointGap);
        const calcY = (point) => this.canvas.height - (this.canvas.height / (this.max / point)) + 5;

        for (var i = 1; i < this.canvas.width; i++) {
            for (let [key, points] of Object.entries(this.points)) {
                const color = key == "default"
                    ? getComputedStyle(this.canvas).color
                    : this.pointGroupColours[key];

                this.ctx.fillStyle = color;
                this.ctx.strokeStyle = color;

                const point = points.slice().reverse()[i];
                const previousPoint = points.slice().reverse()[i - 1];

                if (point && !isNaN(point)) {
                    const x = calcX(i);
                    const y = calcY(point);

                    if (x < (0 - this.pointGap)) {
                        const clone = points.slice().reverse();
                        const actualIndex = i;
                        clone[actualIndex] = NaN;
                        points = clone.reverse();
                    }

                    const index = Object.keys(this.points).findIndex(k => k == key);

                    this.ctx.beginPath();
                    this.ctx.arc(x, y + index, key == "default" ? 1 : 2, 0, 2 * Math.PI);
                    this.ctx.fill();

                    if (previousPoint) {
                        const prevX = calcX(i - 1);
                        const prevY = calcY(previousPoint) + index;

                        this.ctx.beginPath();
                        this.ctx.moveTo(prevX, prevY);
                        this.ctx.lineTo(x, y + index);
                        this.ctx.lineWidth = 2;
                        this.ctx.stroke();
                    }
                }
            }
        }

        const yWidth = this.axes.y?.querySelector("ul")?.getBoundingClientRect().width;
        this.axes.x?.querySelector("ul")?.style.setProperty("--y-width", yWidth + "px");

        const yScale = this.axes.y.querySelector("ul").childNodes;
        let yIndex = 0;
        for (const yScaleItem of Array.from(yScale).reverse()) {
            if (i == 0) {
                yScaleItem.textContent = formatBytes(this.max, 0, 1000);
                continue;
            }

            yScaleItem.textContent = formatBytes(
                Math.ceil(((this.max / (yScale.length - 1)) * yIndex) / 10) * 10,
                0,
                1000
            );

            yIndex++;
        }
    }

    points = {};
    pointGroupColours = {
        default: "currentColor"
    };
    // this should be enough colours for now
    groupColours = [
        "#f03333",
        "#fe6c2e",
        "#ffd129",
        "#31c708",
        "#33f0c1",
        "#3fa9f5",
        "#3452e9",
        "#7846eb",
        "#b458ed",
        "#e467f0",
        "#5F464B",
        "#8E4A49",
        "#7DAA92",
        "#6F1D1B",
        "#BB9457",
        "#432818",
        "#545863",
        "#00e8fc",
        "#f96e46",
        "#545454",
    ];

    /**
     * Adds a point to the graph
     * @param {number} y 
     */
    addPoint(y, name = "default") {
        if (!this.points[name]) this.points[name] = [];
        if (!this.pointGroupColours[name] && name !== "default") {
            if (this.groupColours.length < 5) {
                this.groupColours.push(
                    "#" + hex(6)
                );
            }

            this.pointGroupColours[name] = this.groupColours[Math.floor(Math.random() * this.groupColours.length)]
            this.groupColours = this.groupColours.filter(c => c !== this.pointGroupColours[name]);
        }

        this.points[name].push(Math.max(y, 1));
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        const yAxis = html("div", { class: "graph-y-axis" },
            html("div", { class: "graph-canvas-container" },
                html("canvas", {})
            ),
            html("ul", {},
                html("li", {}, "100%"),
                html("li", {}, "80%"),
                html("li", {}, "60%"),
                html("li", {}, "40%"),
                html("li", {}, "20%"),
                html("li", {}, "0%"),
            )
        );

        const xAxis = html("div", { class: "graph-x-axis" },
            html("ul", {},
                html("li", {}, "1m"),
                html("li", {}, "50s"),
                html("li", {}, "40s"),
                html("li", {}, "30s"),
                html("li", {}, "20s"),
                html("li", {}, "10s"),
                html("li", {}, "0s"),
            )
        );

        this.appendChild(yAxis);
        this.appendChild(xAxis);

        this.resizeObserver = new ResizeObserver(this.observeResize)
        this.resizeObserver.observe(this.canvas.parentElement);

        this.ctx.translate(0.5, 0.5);

        setInterval(() => {
            this.paint();
        }, 100);

        requestAnimationFrame(this.paint.bind(this));
    }
}

customElements.define("dev-debug-graph", DeveloperDebugGraph);