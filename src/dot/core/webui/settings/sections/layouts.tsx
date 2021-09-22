import React from "react";
import { UISwitch } from "../components/Switch";

interface SwitchProps {
    text: string,
    description?: string,
    pref: string
}

class Switch extends React.Component<SwitchProps> {
    public constructor(props: SwitchProps) {
        super(props);
    }

    public render() {
        const {
            text,
            description,
            pref
        } = this.props;

        return (
            <div className={"settings-layout-switch"}>
                <div className={"settings-layout-titles"}>
                    <h1>{text}</h1>
                    {description && <p>{description}</p>}
                </div>

                <UISwitch type={"pref"} pref={pref} />
            </div>
        )
    }
}

export const Layouts = {
    Switch
}