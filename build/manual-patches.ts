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
        name: "automatic",
        action: "copy",
        src: "toolkit/mozapps/extensions/default-theme"
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
        src: "browser/components/preferences/new"
    },
    {
        name: "dotprotocol",
        action: "copy",
        src: "toolkit/components/dotprotocol"
    },
    {
        name: "engines",
        action: "copy",
        src: [
            "browser/components/search/extensions/ddg",
            "browser/components/search/extensions/ecosia",
            "browser/components/search/extensions/bing",
            "browser/components/search/extensions/google",
            "browser/components/search/extensions/qwant",
            "browser/components/search/extensions/startpage"
        ]
    },
    {
        name: "theme-assets",
        action: "copy",
        src: [
            "toolkit/mozapps/extensions/content/default-theme.svg",
            "toolkit/mozapps/extensions/content/firefox-compact-dark.svg",
            "toolkit/mozapps/extensions/content/firefox-compact-light.svg"
        ]
    },
];

export default manualPatches;
