import React, { FC, useEffect } from "react";
import { ChromeUtils, Ci } from "../../../../../modules";

const { Services } = ChromeUtils.import(
    "resource://gre/modules/Services.jsm"
);

let gDefaultBranch = Services.prefs.getDefaultBranch("");

const GETTERS_BY_PREF_TYPE = {
    [Ci.nsIPrefBranch.PREF_BOOL]: "getBoolPref",
    [Ci.nsIPrefBranch.PREF_INT]: "getIntPref",
    [Ci.nsIPrefBranch.PREF_STRING]: "getStringPref"
};

export const Item: FC<{ name: string; type: number }> = ({
    name,
    type
}) => {
    const [value, setValue] = React.useState<
        null | string | number | boolean
    >(null);

    useEffect(() => {
        let val = null;

        try {
            val =
                gDefaultBranch[
                    GETTERS_BY_PREF_TYPE[type]
                ](name);
        } catch (e) {
            console.error(e);
        }
        setValue(val);
    }, []);

    return (
        <div>
            <b>{name}:</b>{" "}
            {value !== null && value.toString()}
        </div>
    );
};
