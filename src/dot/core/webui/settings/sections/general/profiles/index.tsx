import React from "react";
import { Layouts } from "../../layouts";

interface ProfilesProps {}

export const Profiles: React.FC<ProfilesProps> = () => (
    <>
        <Layouts.Checkbox
            text={"Restore previous session"}
            pref={"browser.startup.page"}
            trueVal={3}
            falseVal={1}
        />
    </>
);
