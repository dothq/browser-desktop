import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { ChromeUtils } from "../../../modules";
import "../theme";
import { Input } from "./components/Input";
import { Item } from "./components/Item";

const { Services } = ChromeUtils.import(
    "resource://gre/modules/Services.jsm"
);

const AboutConfig = () => {
    const [search, setSearch] = React.useState("");
    const [prefs, setPrefs] = React.useState<
        { name: string; type: number }[]
    >([]);

    useEffect(() => {
        const allPreferences =
            Services.prefs.getChildList("");
        setPrefs(
            allPreferences.map((name: string) => ({
                name,
                type: Services.prefs.getPrefType(name)
            }))
        );
    }, []);

    return (
        <>
            <Input
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
            />

            {prefs
                .filter((pref) =>
                    pref.name.includes(search)
                )
                .map((pref) => (
                    <Item
                        key={pref.name}
                        type={pref.type}
                        name={pref.name}
                    />
                ))}
        </>
    );
};

ReactDOM.render(
    <AboutConfig />,
    document.getElementById("config")
);
