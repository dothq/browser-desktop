import React from "react";
import { Tab } from "../../models/Tab";
import { SiteDataManager } from "../../modules";
import { PopupItem, PopupScreen } from "../dialogs/popup";

export const SiteIdentityMainScreen = ({
    tab
}: {
    tab: Tab;
}) => {
    const manager = tab.identityManager;

    const data = manager.getIdentityStrings();

    let certificate =
        data.icon == "https" && manager.getCertData();

    let cookiesInUse = 0;

    if (data.icon.startsWith("http")) {
        SiteDataManager.updateSites().then(async () => {
            const data = await SiteDataManager.getSites(
                SiteDataManager.getBaseDomainFromHost(
                    tab.urlParsed.host
                )
            );

            if (data) {
                cookiesInUse =
                    data
                        .map((x: any) => x.cookies.length)
                        .reduce(
                            (
                                prev: number,
                                next: number
                            ) => prev + next
                        ) || 0;
            }
        });
    }

    return (
        <PopupScreen
            title={`Site information for ${manager.identityHost}`}
        >
            <PopupItem
                icon={`identity/${data.icon}`}
                title={data.msg}
                colour={data.colour}
                noHover={true}
            />

            {data.icon == "https" && certificate && (
                <PopupItem
                    icon={"certificate"}
                    title={"Certificate"}
                    subtitle={`Issued by: ${
                        certificate.issuer || ""
                    }`}
                />
            )}

            {data.icon.startsWith("http") && (
                <PopupItem
                    icon={"cookie"}
                    title={"Cookies"}
                    subtitle={`${cookiesInUse} in use`}
                />
            )}

            {data.icon.startsWith("http") && (
                <PopupItem
                    icon={"permission"}
                    title={"Site permissions"}
                    noHover={true}
                />
            )}
        </PopupScreen>
    );
};
