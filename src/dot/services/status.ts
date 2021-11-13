import { dot } from "../api";
import { nsIBrowserHandler, Services } from "../modules";
import { exportPublic } from "../shared/globals";

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

    public get panelType() {
        const allowedValues = ["floating", "fixed"];
        const value = dot.prefs.get("dot.ui.statusbar.type");

        if(allowedValues.includes(value)) return value;
        else return "floating";
    }

    public hide() {
        if(!this.panel) return;
        
        // In floating mode, we just hide the statusbar
        // In fixed mode, it won't disappear so we just clear the value
        if(this.panelType == "floating") {
            this.panel.hidden = true;
        } else if(this.panelType == "fixed") {
            this.label = "";
        }
    }

    public update(message?: string, isBusy?: boolean) {
        if (
            nsIBrowserHandler.kiosk ||
            !this.panel ||
            !this.labelElement
        )
            return;

        if(
            isBusy !== undefined && 
            isBusy == true
        ) {
            if(dot.tabs.selectedTab?.state == "idle") {
                return this.hide();
            }
        }

        if(
            !message || 
            !message.length
        ) {
            this.hide();
        } else {
            this.panel.hidden = false;

            if (
                message.length > 500 &&
                message.match(/^data:[^,]+;base64,/)
            ) {
                message = `${message.substring(0, 500)}\u2026`;
            }
    
            if (
                this.labelElement.innerText !== message ||
                (message && !this.isVisible)
            ) {
                this.label = message;
            }
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
        if(!this.labelElement) return;

        this.labelElement.innerText = val;
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
