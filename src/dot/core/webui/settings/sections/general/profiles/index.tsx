import React from "react";
import { Layouts } from "../../layouts";

interface ProfilesProps {}

export class Profiles extends React.Component<ProfilesProps> {
    public constructor(props: ProfilesProps) {
        super(props);
    }

    public render() {
        return (
            <>
                <Layouts.Checkbox
                    text={"Restore previous session"}
                    pref={"browser.startup.page"}
                    trueVal={3}
                    falseVal={1}
                />
            </>
        );
    }
}
