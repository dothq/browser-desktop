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
            "browser/components/abouthistory1",
            "browser/locales/en-US/browser/aboutHistory.ftl",
            "browser/actors/AboutHistoryChild.jsm",
            "browser/actors/AboutHistoryParent.jsm"
        ]
    },
    {
        name: "preferences",
        action: "copy",
        src: "browser/components/preferences/new"
    },
    {
        name: "dotprotocol",
        action: "copy",
        src: "toolkit/components/dotprotocol"
    },
    {
        name: "default-engine",
        action: "markers",
        markers: {
            "toolkit/components/search/SearchEngineSelector.jsm": [
                // <-- target file
                "// INJECT DEFAULT SEARCH ENGINES - START",
                "// INJECT DEFAULT SEARCH ENGINES - END"
            ]
        },
        indent: 5, // indent everything by 5 tabs
        src: "engines.json" // <-- content file
    }
];

export default manualPatches;
