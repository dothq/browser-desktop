import React, { FC } from "react";
import { UICheckbox } from "../components/Checkbox";
import { UISelect } from "../components/Select";
import { UISwitch } from "../components/Switch";
import { ControlType } from "../components/types";

// TODO: Do we really need these for simple components like checkboxes? Can we
// refactor them away if possible?

// =============================================================================
// Switch layout
interface SwitchProps {
    text: string;
    description?: string;
    pref: string;
}

class Switch extends React.Component<SwitchProps> {
    public constructor(props: SwitchProps) {
        super(props);
    }

    public render() {
        const { text, description, pref } = this.props;

        return (
            <div className={"settings-layout-switch"}>
                <div className={"settings-layout-titles"}>
                    <h1>{text}</h1>
                    {description && <p>{description}</p>}
                </div>

                <UISwitch type={"pref"} pref={pref} />
            </div>
        );
    }
}

// =============================================================================
// Checkbox layout

interface CheckboxProps {
    text: string;
    pref: string;
    trueVal?: string | number;
    falseVal?: string | number;
}

class Checkbox extends React.Component<CheckboxProps> {
    public constructor(props: CheckboxProps) {
        super(props);
    }

    public render() {
        const { text, pref, trueVal, falseVal } =
            this.props;

        return (
            <div className={"settings-layout-checkbox"}>
                <UICheckbox
                    type={ControlType.Preference}
                    pref={pref}
                    trueVal={trueVal}
                    falseVal={falseVal}
                >
                    {text}
                </UICheckbox>
            </div>
        );
    }
}

// =============================================================================
// Select layout

const Select: FC<{
    text: string;
    description?: string;
    values: {
        /**
         * The settings key that should be used
         */
        key: string | number;
        /**
         * The text that should be displayed
         */
        name: string;
    }[];
    pref: string;
}> = ({ text, description, pref, values }) => (
    <div className="settings-layout-select">
        <div className={"settings-layout-titles"}>
            <h1>{text}</h1>
            {description && <p>{description}</p>}
        </div>

        <UISelect pref={pref} values={values} />
    </div>
);

export const Layouts = {
    Switch,
    Checkbox,
    Select
};
