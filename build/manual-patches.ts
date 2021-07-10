import { IPatch } from "./interfaces/patch";

const manualPatches: IPatch[] = [
    {
        name: "branding",
        action: "copy",
        src: "browser/branding/dot"
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
        name: "themes",
        action: "copy",
        src: [
            "toolkit/mozapps/extensions/default-theme",
            "browser/themes/addons/fusion",
            "browser/themes/addons/light",
            "browser/themes/addons/dark",

            "toolkit/mozapps/extensions/content/default-theme.svg",
            "toolkit/mozapps/extensions/content/firefox-compact-dark.svg",
            "toolkit/mozapps/extensions/content/firefox-compact-light.svg",
            "toolkit/mozapps/extensions/content/firefox-compact-fusion.svg"
        ]
    },
    {
        name: "icons",
        action: "copy",
        src: [
            "other-licenses/7zstub/firefox/setup.ico",
            "toolkit/mozapps/update/updater/updater.ico",
            "toolkit/mozapps/update/updater/updater.png",

            "layout/generic/broken-image.svg"
        ]
    }
];

export default manualPatches;
