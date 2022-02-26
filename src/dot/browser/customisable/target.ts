import { createRef, div, RefObject } from "oikia";

function noop() {
    return false;
}

class CustomisableUITarget {
    public id: string | undefined;

    public ref?: RefObject<HTMLDivElement>;

    public visible:
        | (() => boolean | undefined)
        | undefined;
    public movable:
        | (() => boolean | undefined)
        | undefined;

    public render() {
        const isVisible = this.visible?.();

        return div({
            id: `browser-${this.id}`,
            ref: this.ref,
            hidden: isVisible
        });
    }

    public constructor() {
        this.ref = createRef<HTMLDivElement>();
    }
}

export default CustomisableUITarget;
