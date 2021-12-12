import { dot } from "../../api";

export class PreferenceObserversStartup {
    public constructor() {
        dot.prefs.observe(
            "dot.ui.accent_colour",
            (value: string) =>
                dot.theme.updateAccentColour(value)
        );

        dot.prefs.observe(
            "dot.window.nativecontrols.enabled",
            (value: boolean) => {
                if (value)
                    dot.window.addWindowClass(
                        "native-window-controls"
                    );
                else
                    dot.window.removeWindowClass(
                        "native-window-controls"
                    );
            },
            true
        );

        dot.prefs.observe(
            "ui.popup.disable_autohide",
            (value: boolean) => {
                dot.utilities.canPopupAutohide = !value;
            },
            true
        );

        dot.prefs.observe(
            "dot.ui.statusbar.disabled",
            (value: boolean) => {
                const className = "statusbar-hidden";

                if (value)
                    dot.window.addWindowClass(
                        className,
                        true,
                        document.documentElement
                    );
                else
                    dot.window.removeWindowClass(
                        className,
                        document.documentElement
                    );
            },
            true
        );

        dot.prefs.observe(
            "dot.ui.statusbar.type",
            (value: 'floating' | 'fixed') => {
                const allowedValues = ["floating", "fixed"];

                let className = (
                    value && 
                    value.length && 
                    allowedValues.includes(value)
                )
                    ? `statusbar-${value}`
                    : "statusbar-floating";

                for(const v of allowedValues) {
                    dot.window.removeWindowClass(
                        `statusbar-${v}`,
                        document.documentElement
                    )
                }

                dot.window.addWindowClass(
                    className,
                    true,
                    document.documentElement
                );
            },
            true
        );

        dot.prefs.observe(
            "dot.ui.roundness",
            (value: any) => {
                dot.theme.updateChromeRoundness(value, true)
            }
        );
    }
}