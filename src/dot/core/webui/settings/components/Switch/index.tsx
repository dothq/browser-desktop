import React from "react";

interface UISwitchProps {
    type: 'pref' | 'loose'
    pref?: string
    initialValue?: boolean
    onChange?: (...args: any) => any
}

interface UISwitchState {
    checked: boolean
}

export class UISwitch extends React.Component<UISwitchProps> {
    public ref = React.createRef<HTMLInputElement>();

    public state: UISwitchState = {
        checked: false
    };

    public constructor(props: UISwitchProps) {
        super(props);

        if (this.props.type == "loose") {
            this.setState({
                checked: this.props.initialValue
            })
        } else if (this.props.type == "pref") {
            // Dynamic typechecking for prefs
            if (!this.props.pref) throw new Error("Preference ID is required.");

            let type = window.dot.prefs.getType(this.props.pref);

            if (!type) {
                console.warn(`Preference with ID ${this.props.pref} does not exist.`);
            }

            if (type == "bool") {
                this.setState({
                    checked: window.dot.prefs.get(this.props.pref)
                })
            }
        }
    }

    public onChange(e: any): any {
        if (
            this.props.type == "loose" &&
            this.props.onChange
        ) {
            this.props.onChange(e);
        } else if (
            this.props.type == "pref" &&
            this.props.pref
        ) {
            let type = window.dot.prefs.getType(this.props.pref);

            if (!type) {
                console.warn(`Preference with ID ${this.props.pref} does not exist.`);
            }

            if (type !== "bool") {
                return console.warn(`Preference with ID ${this.props.pref} is not of type bool.`);
            }

            window.dot.prefs.set(
                this.props.pref,
                this.state.checked
            );
        }
    }

    public render() {
        return (
            <div
                className={"settings-switch"}
                data-checked={this.state.checked}
                onClick={(e) => {
                    this.setState({
                        checked: !this.state.checked
                    })

                    this.onChange(e);
                }}
            >
                <div className={"settings-switch-cover"}>
                    <i className={"settings-switch-pop"}></i>
                </div>
            </div>
        )
    }
}