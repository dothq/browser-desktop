import { symlink } from "fs-extra"
import { resolve } from "path"
import rimraf from "rimraf"
import { engineDir, srcDir } from "../utils/path"

export const importManagedPatches = async () => {
    rimraf.sync(resolve(engineDir, "dot"));
    rimraf.sync(resolve(engineDir, "browser", "confvars.sh"));

    await symlink(
        srcDir,
        resolve(engineDir, "dot")
    )

    await symlink(
        resolve(srcDir, "confvars.sh"),
        resolve(engineDir, "browser", "confvars.sh")
    )
}