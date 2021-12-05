import { gsap } from "gsap";
import { exportPublic } from "../shared/globals";

export const animate = (
    selector: string | object | null, 
    options: gsap.TweenVars
) => {
    return gsap.to(
        selector, 
        options
    );
}

exportPublic("animate", animate);