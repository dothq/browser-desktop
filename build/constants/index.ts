import execa from "execa";
import { resolve } from "path";

export const BUILD_TARGETS = [
    "linux",
    "windows",
    "macos"
];

export const ARCHITECTURE = ["i686", "x86_64"];

export const PATCH_ARGS = [
    "--ignore-space-change",
    "--ignore-whitespace",
    "--verbose"
];

export const ENGINE_DIR = resolve(
    process.cwd(),
    "engine"
);
export const SRC_DIR = resolve(process.cwd(), "src");
export const PATCHES_DIR = resolve(
    process.cwd(),
    "patches"
);
export const COMMON_DIR = resolve(
    process.cwd(),
    "common"
);
export const CONFIGS_DIR = resolve(
    process.cwd(),
    "configs"
);

export let CONFIG_GUESS: any = null;

try {
    CONFIG_GUESS = execa.commandSync(
        "./build/autoconf/config.guess",
        { cwd: ENGINE_DIR }
    ).stdout;
} catch (e) {}

export const OBJ_DIR = resolve(
    ENGINE_DIR,
    `obj-${CONFIG_GUESS}`
);

export const FTL_STRING_LINE_REGEX =
    /(([a-zA-Z0-9\-]*|\.[a-z\-]*) =(.*|\.)|\[[a-zA-Z0-9]*\].*(\n\s?\s?})?|\*\[[a-zA-Z0-9]*\] .*(\n\s?\s?})?)/gm;
