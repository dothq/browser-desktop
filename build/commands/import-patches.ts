import { log, bin_name } from "..";
import { COMMON_DIR, CONFIG_GUESS, OBJ_DIR, PATCHES_DIR, SRC_DIR } from "../constants";

export const importPatches = () => {
    console.log(SRC_DIR)
    console.log(COMMON_DIR)
    console.log(PATCHES_DIR)
    console.log(OBJ_DIR)
    console.log(CONFIG_GUESS)

    if (process.platform == "win32")
        log.warning(
            `If you get any line ending errors, you should try running |${bin_name} fix-le|.`
        );


}