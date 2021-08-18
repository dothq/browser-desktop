import React from "react";

export class Search extends React.Component {
    public render() {
        return (
            <div className={"widget-searchbox tm"}>
                <i className={"widget-searchbox-icon"}></i>
                <input
                    className={"widget-searchbox-input"}
                    placeholder={"Search using DuckDuckGo or enter URL"}
                >
                </input>
            </div>
        )
    }
}