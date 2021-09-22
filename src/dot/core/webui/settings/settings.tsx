import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Sidebar } from "../shared/Sidebar";
import "../theme";
import { RenderSheet } from "./components/RenderSheet";
import { Load } from "./events/load";
import { sections } from "./sections/sections";
import { store } from "./store";

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
            <Provider store={store}>
                <Sidebar
                    title={"Settings"}
                    items={Object.values(sections)}
                />

                <RenderSheet />
            </Provider>
        )
    }
}

ReactDOM.render(
    <Settings />,
    document.getElementById("settings")
)