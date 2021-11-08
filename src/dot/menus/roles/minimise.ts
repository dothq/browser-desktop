import { dot } from "../../api";

export const MinimiseMenuRole = {
    id: "minimize",
    label: "Minimize",
    type: "normal",
    click: () => {
        dot.window.minimise();
    }
};
