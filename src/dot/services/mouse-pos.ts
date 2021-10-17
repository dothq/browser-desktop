import { exportPublic } from "../shared/globals";

class MousePosTracker {
    public listeners = new Set();

    public x = 0;
    public y = 0;

    public addListener(listener: any) {
        if (this.listeners.has(listener)) return;

        listener._hover = false;
        this.listeners.add(listener);

        this.callListener(listener);
    }

    public removeListener(listener: any) {
        this.listeners.delete(listener);
    }

    public handleEvent(event: MouseEvent) {
        const { mozInnerScreenX, mozInnerScreenY } = window;
        const { fullZoom } = window.windowUtils;

        this.x = event.screenX / fullZoom - mozInnerScreenX;
        this.y = event.screenY / fullZoom - mozInnerScreenY;

        for (const listener of this.listeners) {
            this.callListener(listener);
        }
    }

    public callListener(listener: any) {
        const {
            top,
            right,
            bottom,
            left
        } = listener.getMouseTargetRect();

        const hover =
            this.x >= left &&
            this.x <= right &&
            this.y >= top &&
            this.y <= bottom;

        if (hover == listener._hover) return;
        else listener._hover = hover;

        if (hover) {
            if (listener.onMouseEnter) listener.onMouseEnter();
        } else if (listener.onMouseLeave) {
            listener.onMouseLeave();
        }
    }
}

export default new MousePosTracker();
exportPublic("MousePosTracker", new MousePosTracker());