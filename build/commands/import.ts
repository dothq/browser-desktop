import { Melon } from "..";
import { importDotPatches } from "../patches/dotpatch";
import { importManagedPatches } from "../patches/managed";

export class ImportCommand {
    public name = "import";
    public description = "Import all patches to the engine directory.";

    public aliases = [
        "import-patches",
        "i"
    ]

    public async exec(cli: Melon) {
        await importDotPatches();
        await importManagedPatches();
    }
}