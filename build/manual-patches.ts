import { sync } from "glob";
import { SRC_DIR } from "./constants";
import { IPatch } from "./interfaces/patch";

let files = sync("**/*", {
    nodir: true,
    cwd: SRC_DIR
}).filter(
    (f) =>
        !(
            f.endsWith(".patch") ||
            f.split("/").includes("node_modules")
        )
);

const manualPatches: IPatch[] = [];

files.map((i) => {
    const group = i.split("/")[0];

    if (!manualPatches.find((m) => m.name == group)) {
        manualPatches.push({
            name: group,
            action: "copy",
            src: files.filter(
                (f) => f.split("/")[0] == group
            )
        });
    }
});

export default manualPatches;
