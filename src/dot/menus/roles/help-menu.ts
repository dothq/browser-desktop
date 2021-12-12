import { kHelpIcon } from "../../core/icons";
import {
    openFeedbackPage,
    openHelpLink,
    openTroubleshootingPage
} from "../../utils/browser";

export const HelpMenuMenuRole = {
    id: "helpmenu",
    label: "Help",
    icon: kHelpIcon,
    type: "submenu",
    submenu: [
        {
            id: "get-help",
            label: "Get help",
            type: "normal",
            click: () => openHelpLink()
        },
        {
            id: "troubleshooting",
            label: "Troubleshoot…",
            type: "normal",
            click: () => openTroubleshootingPage()
        },
        {
            type: "separator"
        },
        {
            id: "report-issue",
            label: "Report issue…",
            type: "normal",
            click: () => openFeedbackPage()
        }
    ]
};
