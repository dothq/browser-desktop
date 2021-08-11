import { MenuItem } from ".";

export const separator: MenuItem = {
    type: "separator"
}

export const trunc = (input: string, max: number) => input.length > max ? `${input.substring(0, max)}…` : input;