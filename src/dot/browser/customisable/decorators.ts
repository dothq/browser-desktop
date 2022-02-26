import CustomisableUITarget from "./target";
import { WidgetCombinedOptions } from "./types/item";

export function Widget<
    K extends keyof WidgetCombinedOptions
>(type: K, options: WidgetCombinedOptions[K]) {
    return function decorate(target: any) {
        target.type = type;

        for (const [key, value] of Object.entries(
            options
        )) {
            target[key] = value;
        }

        return target;
    };
}

export function Target(
    options: Omit<CustomisableUITarget, "ref" | "render">
) {
    return function decorate(target: any) {
        console.log(target);

        for (const [key, value] of Object.entries(
            options
        )) {
            target[key] = value;
        }

        console.log(target);

        return target;
    };
}
