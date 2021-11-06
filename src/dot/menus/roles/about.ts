import { AppConstants } from "../../modules";

export const AboutMenuRole = {
    id: "about",
    label: "About Dot Browser",
    icon: "chrome://dot/content/skin/icons/identity/info.svg",
    type: "normal",
    click: () => {
        console.log(AppConstants)
    }
}