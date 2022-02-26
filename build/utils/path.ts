import { resolve } from "path";

export const patchesDir = resolve(
    process.cwd(),
    "patches"
);
export const engineDir = resolve(process.cwd(), "engine");
export const srcDir = resolve(process.cwd(), "src");
