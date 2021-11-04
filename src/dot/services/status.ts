import { dot } from "../api";
import { nsIBrowserHandler, Services } from "../modules";
import { exportPublic } from "../shared/globals";
import MousePosTracker from "./mouse-pos";

class StatusService {
    public get panel() {
        return document.getElementById(
            "navigator-statusbar"
        );
    }

    public get isVisible() {
        return this.panel?.hasAttribute("active");
    }

    public get isRTL() {
        return Services.locale.isAppLocaleRTL;
    }

    public update() {
        if (
            nsIBrowserHandler.kiosk ||
            !this.panel ||
            !this.labelElement
        )
            return;

        let text;
        let type;
        let types = ["overLink"];

        if (dot.runtime.busyUI) types.push("status");
        types.push("defaultStatus");

        for (type of types) {
            if ((text = (dot.runtime as any)[type])) {
                break;
            }
        }

        let cropped = false;
        if (
            text.length > 500 &&
            text.match(/^data:[^,]+;base64,/)
        ) {
            text = `${text.substring(0, 500)}\u2026`;
            cropped = true;
        }

        if (
            this.labelElement.innerText !== text ||
            (text && !this.isVisible)
        ) {
            this.panel.setAttribute(
                "previoustype",
                `${this.panel.getAttribute("type")}`
            );
            this.panel.setAttribute("type", `${type}`);

            this.label = text;
            this.labelElement.setAttribute(
                "crop",
                type == "overLink" && !cropped
                    ? "center"
                    : "end"
            );
        }
    }

    public get labelElement():
        | HTMLSpanElement
        | undefined {
        const el = this.panel?.getElementsByClassName(
            "statusbar-status"
        )[0];

        return el as HTMLSpanElement | undefined;
    }

    public set label(val: string) {
        if (!this.panel || !this.labelElement) return;

        if (!this.isVisible) {
            this.panel?.removeAttribute("mirror");
            this.panel?.removeAttribute("sizelimit");
        }

        if (
            this.panel?.getAttribute("type") ==
                "status" &&
            this.panel?.getAttribute("previoustype") ==
                "status"
        ) {
            const { width } =
                window.windowUtils.getBoundsWithoutFlushing(
                    this.panel
                );

            this.panel.style.minWidth = `${width}px`;
        } else {
            this.panel.style.minWidth = "";
        }

        if (val) {
            this.labelElement.innerText = val;
            this.panel.removeAttribute("inactive");

            MousePosTracker.addListener(this);
        } else {
            this.panel.setAttribute("inactive", "true");

            MousePosTracker.removeListener(this);
        }
    }

    public getMouseTargetRect() {
        const panelParent = this.panel?.parentNode;
        const panelRect =
            window.windowUtils.getBoundsWithoutFlushing(
                this.panel
            );
        const panelParentRect =
            window.windowUtils.getBoundsWithoutFlushing(
                panelParent
            );

        return {
            top: panelRect.top,
            bottom: panelRect.bottom,
            left: this.isRTL
                ? panelParentRect.right - panelRect.width
                : panelParentRect.left,
            right: this.isRTL
                ? panelParentRect.right
                : panelParentRect.left + panelRect.width
        };
    }

    public onMouseEnter() {
        this.swapSides();
    }

    publiconMouseLeave() {
        this.swapSides();
    }

    public swapSides() {
        if (!this.panel) return;

        if (this.panel.hasAttribute("mirror")) {
            this.panel.removeAttribute("mirror");
        } else {
            this.panel.setAttribute("mirror", "true");
        }

        if (!this.panel.hasAttribute("sizelimit")) {
            this.panel.setAttribute("sizelimit", "true");
        }
    }
}

export default new StatusService();
exportPublic("StatusService", new StatusService());
