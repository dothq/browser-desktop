import { kInfoIcon } from "../../core/icons";
import { AppConstants } from "../../modules";

export const AboutMenuRole = {
    id: "about",
    label: "About Dot Browser",
    icon: kInfoIcon,
    type: "normal",
    click: () => {
        console.log(AppConstants);
    }
};
