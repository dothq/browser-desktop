import React from "react";
import { Layouts } from "../../layouts";

interface ProfilesProps { }

export class Profiles extends React.Component<ProfilesProps> {
    public constructor(props: ProfilesProps) {
        super(props);
    }

    public render() {
        return (
            <Layouts.Switch
                text={"Show Menu Bar"}
                description={"Makes the menu bar visible at all times."}
                pref={"dot.settings.test.menubar.visible"}
            />
        )
    }
}