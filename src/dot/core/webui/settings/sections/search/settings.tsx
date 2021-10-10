import React from "react";
import { Layouts } from "../layouts";

export const SearchSettings = () => {
    return (
        <>
            <Layouts.Select
                text="Search engine"
                pref="dot.search.engine"
                values={[
                    { key: "ddg", name: "DuckDuckGo" }
                ]}
            />
        </>
    );
};
