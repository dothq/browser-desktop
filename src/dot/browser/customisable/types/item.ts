import { OikiaElement } from "oikia";

export interface WidgetItem {
    id: string | (() => string);
}

export interface WidgetButtonOptions extends WidgetItem {
    label: string | (() => string);
    tooltip: string | (() => string);

    showLabelByDefault?: boolean;

    icon?: string | (() => string);
}

export interface WidgetSpecialOptions extends WidgetItem {
    render: (event: any) => OikiaElement;
}

export interface WidgetCombinedOptions {
    button: WidgetButtonOptions
    input: WidgetSpecialOptions
    special: WidgetSpecialOptions
};

export type WidgetType = keyof WidgetCombinedOptions;