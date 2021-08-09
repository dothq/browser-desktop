import { negotiateLanguages } from '@fluent/langneg';
import { LocalizationProvider, ReactLocalization } from '@fluent/react';
import React from "react";
import { dot } from "../api";
import { allLocales } from './all-locales';

const DEFAULT_LOCALE = "en-GB"; // This should never change

function* generateBundles(userLocales: string[], availableLocales: string[]) {
    const currentLocales = negotiateLanguages(
        userLocales,
        availableLocales,
        { defaultLocale: DEFAULT_LOCALE }
    );

    for (const locale of currentLocales) {
        yield allLocales[locale];
    }
}

export const L10nProvider = ({ children }: { children: React.ReactNode }) => {
    let [l10n, setL10n] = React.useState<ReactLocalization | null>(null);

    React.useEffect(() => {
        const bundles = generateBundles(
            dot.utilities.browserLanguages,
            Object.keys(allLocales)
        );

        const locales = new ReactLocalization(bundles);

        setL10n(locales);
    }, [])

    return l10n == null ? <></> : <LocalizationProvider l10n={l10n}>
        {React.Children.only(children)}
    </LocalizationProvider>;
}
