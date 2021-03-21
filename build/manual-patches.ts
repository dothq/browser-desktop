import { IPatch } from "./interfaces/patch";

const manualPatches: IPatch[] = [
    {
        name: "branding",
        action: "copy",
        src: "browser/branding/dot"
    },
    {
        name: "fusion",
        action: "copy",
        src: "browser/themes/addons/fusion"
    },
    {
        name: "dotui",
        action: "copy",
        src: "browser/themes/shared/dotui"
    },
    {
        name: "about:history",
        action: "copy",
        src: [
            "browser/components/abouthistory",
            "browser/locales/en-US/browser/aboutHistory.ftl",
            "browser/actors/AboutHistoryChild.jsm",
            "browser/actors/AboutHistoryParent.jsm"
        ]
    },
    {
        name: "preferences",
        action: "copy",
        src: ["browser/components/preferences/new"]
    },
    {
        name: "bingus",
        action: "copy",
        src: ["browser/bingus"]
    }
];

export default manualPatches;