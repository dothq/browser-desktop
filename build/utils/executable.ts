import { resolve } from "path"
import { engineDir } from "./path"
import { $$ } from "./sh"

export const makeExecutable = async () => {
    // Bug with scripts not being executable
    await $$({ cwd: engineDir, shutUp: true })`chmod +x ${resolve(engineDir, "build", "cargo-linker")}`
    await $$({ cwd: engineDir, shutUp: true })`chmod +x ${resolve(engineDir, "mach")}`
}