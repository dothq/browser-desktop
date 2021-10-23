import React from "react";

export const Search = () => {
    const [query, setQuery] = React.useState("");

    return (
        <div className={"widget-searchbox tm"}>
            <i className={"widget-searchbox-icon"}></i>
            <input
                className={"widget-searchbox-input"}
                placeholder={
                    "Search using DuckDuckGo or enter URL"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        // // TODO: Use the same logic as is employed by the url bar here
                        // const searchURL =
                        //     window.dot.search.providers.engine.constructSearchUrl(
                        //         query
                        //     );

                        // window.location.href = searchURL;
                    }
                }}
            />
        </div>
    );
};
