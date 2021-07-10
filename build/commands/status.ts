import { existsSync } from "fs";
import { log } from "..";
import { ENGINE_DIR } from "../constants";
import { dispatch } from "../utils";

export const status = async () => {
    if (existsSync(ENGINE_DIR)) {
        dispatch("git", ["status"], ENGINE_DIR, true);
    } else {
        log.error(`Unable to locate src directory.`);
    }
};
