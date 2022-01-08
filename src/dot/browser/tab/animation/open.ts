import anime from "animejs";
import { css, OikiaElement, RefObject } from "oikia";
// import { TAB_MAX_WIDTH } from "../../../shared/tab";

export class TabOpenAnimation {
    public constructor(public tabRef: RefObject<OikiaElement>) {}

    public async play(duration: number = 200): Promise<boolean> {
        return new Promise((resolve) => {
            // Reset the width
            css(
                this.tabRef.current,
                "width",
                0
            );

            anime({
                targets: this.tabRef.current,
                width: 250 /* TAB_MAX_WIDTH */,
                duration,
                easing: "easeOutQuint"
            });

            setTimeout(() => resolve(true), duration);
        });
    }
}