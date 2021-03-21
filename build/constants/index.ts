import execa from "execa";
import { resolve } from "path";

export const BUILD_TARGETS = [
    "linux",
    "windows",
    "macos"
];

export const SRC_DIR = resolve(
    process.cwd(),
    "src"
);
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
        { cwd: SRC_DIR }
    ).stdout;
} catch (e) {}

export const OBJ_DIR = resolve(
    SRC_DIR,
    `obj-${CONFIG_GUESS}`
);
