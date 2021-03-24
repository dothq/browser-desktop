export interface IPatch {
    name: string;
    action: string;
    src: string | string[];
    markers?: {
        [key: string]: [string, string];
    };
    indent?: number;
}
