import React from "react";
import { settings } from "../api";
import { GeneralSection } from "./general";

interface SectionProps {
    visible?: boolean;
}

export class Section extends React.Component<SectionProps> {
    static id = "";
    static text = "";
    static icon = "";

    public constructor(props: SectionProps) {
        super(props);
    }

    static visible() {
        return settings.selectedSection == this.id;
    }
}

export const sections = [GeneralSection];
