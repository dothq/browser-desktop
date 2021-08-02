import React from "react"
import { dot } from "../../../../api"
import { Services } from "../../../../modules"

export const ThemePickerStorePromo = () => {
    return (
        <>
            <a className={"settings-themepicker-promo"} onClick={() => {
                const url = Services.io.newURI(
                    Services.urlFormatter.formatURLPref(
                        "extensions.getAddons.link.url"
                    )
                );

                dot.tabs.selectedTab?.goto(url);
            }}>
                <label className={"settings-themepicker-promo-label"}>
                    Find more themes in the theme store.
                </label>

                <i
                    className={"settings-themepicker-promo-image"}
                    style={{
                        backgroundImage: "url(chrome://dot/content/skin/icons/shopping-bag.svg)"
                    }}
                ></i>
            </a>
        </>
    )
}