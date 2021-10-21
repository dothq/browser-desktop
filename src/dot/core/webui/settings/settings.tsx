import React from "react";
import ReactDOM from "react-dom";
import { Sidebar } from "../shared/Sidebar";
import "../theme";
import { RenderSheet } from "./components/RenderSheet";
import { Load } from "./events/load";
import { sections } from "./sections/sections";
// import { store } from "./store";

class Settings extends React.Component {
    public constructor(props: any) {
        super(props);
    }

    public componentDidMount() {
        // Trigger load event
        new Load();
    }

    public render() {
        return (
            <>
                <Sidebar
                    title={"Settings"}
                    items={Object.values(sections)}
                />

               <RenderSheet />
            </>
        );
    }
}

ReactDOM.render(
    <Settings />,
    document.getElementById("settings")
);
