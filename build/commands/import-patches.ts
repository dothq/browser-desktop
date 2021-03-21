import commander from "commander";
import { platform } from "os";
import { log, bin_name } from "..";
import { importManual } from "../utils";

class ImportPatchesController {
    public totalImported = 0;

    public async run() {
        await importManual();
    }

    constructor(args?: any) {
        if (process.platform == "win32")
            log.warning(
                `If you encounter any errors about line endings, try running |${bin_name} fix-le|.`
            );

        this.run();
    }
}

export const importPatches = ImportPatchesController;
