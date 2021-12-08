import { observer } from "mobx-react";
import { render } from "preact";
import React from "react";
import { timers } from "../../services/timers";
import "../webui/theme";
import { Sidebar } from "./components/Sidebar";
import { Load } from "./events/load";
import { sections } from "./sections";

@observer
class Settings extends React.Component {
    public constructor(props: any) {
        super(props);

        timers.start("SettingsLoad");
    }

    public componentDidMount() {
        // Trigger load event
        new Load();
    }

    public render() {
        return (
            <>
                <Sidebar />

                <div>
                    {sections.map((Section, index) => {
                        return <Section />;
                    })}
                </div>
            </>
        );
    }
}

render(
    <Settings />,
    document.getElementById("settings") as Element,
);
