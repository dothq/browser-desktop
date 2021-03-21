import { existsSync } from "fs";
import { log } from "..";
import { SRC_DIR } from "../constants";
import { dispatch } from "../utils";

export const status = async () => {
    if (existsSync(SRC_DIR)) {
        dispatch("git", ["status"], SRC_DIR, true);
    } else {
        log.error(`Unable to locate src directory.`);
    }
};
