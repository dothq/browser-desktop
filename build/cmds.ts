import {
    bootstrap,
    build,
    discard,
    download,
    downloadArtifacts,
    execute,
    exportFile,
    exportPatches,
    fixLineEndings,
    importPatches,
    init,
    licenseCheck,
    melonPackage,
    reset,
    run,
    setBranch,
    status,
    test
} from "./commands";
import { Cmd } from "./types";

export const commands: Cmd[] = [
    {
        cmd: "bootstrap",
        description: "Bootstrap Dot Browser.",
        controller: bootstrap
    },
    {
        cmd: "build [os]",
        aliases: ["b"],
        description:
            "Build Dot Browser. Specify the OS param for cross-platform builds.",
        options: [
            {
                arg: "--a, --arch <architecture>",
                description:
                    "Specify architecture for build"
            }
        ],
        controller: build
    },
    {
        cmd: "discard <file>",
        description: "Discard a files changes.",
        options: [
            {
                arg: "--keep, --keep-patch",
                description:
                    "Keep the patch file instead of removing it"
            }
        ],
        controller: discard
    },
    {
        cmd: "download [ffVersion]",
        description: "Download Firefox.",
        controller: download
    },
    {
        cmd: "download-artifacts",
        description:
            "Download Windows artifacts from GitHub.",
        flags: {
            platforms: ["win32"]
        },
        controller: downloadArtifacts
    },
    {
        cmd: "execute",
        description:
            "Execute a command inside the engine directory.",
        controller: execute
    },
    {
        cmd: "export-file <file>",
        description: "Export a changed file as a patch.",
        controller: exportFile
    },
    {
        cmd: "export",
        aliases: ["export-patches"],
        description:
            "Export the changed files as patches.",
        controller: exportPatches
    },
    {
        cmd: "lfify",
        aliases: ["fix-le"],
        description:
            "Convert CRLF line endings to Unix LF line endings.",
        controller: fixLineEndings
    },
    {
        cmd: "import [type]",
        aliases: ["import-patches", "i"],
        description: "Import patches into the browser.",
        options: [
            {
                arg: "-m, --minimal",
                description:
                    "Import patches in minimal mode"
            },
            {
                arg: "--noignore",
                description:
                    "Bypass .gitignore. You shouldn't really use this."
            }
        ],
        controller: importPatches
    },
    {
        cmd: "init <source>",
        aliases: ["initialise", "initialize"],
        description: "Initialise the Firefox directory.",
        controller: init
    },
    {
        cmd: "license-check",
        aliases: ["lc"],
        description:
            "Check the src directory for the absence of MPL-2.0 header.",
        controller: licenseCheck
    },
    {
        cmd: "package",
        aliases: ["pack"],
        description:
            "Package the browser for distribution.",
        controller: melonPackage
    },
    {
        cmd: "reset",
        description:
            "Reset the source directory to stock Firefox.",
        controller: reset
    },
    {
        cmd: "run [chrome]",
        aliases: ["r", "open"],
        description: "Run the browser.",
        controller: run
    },
    {
        cmd: "set-branch <branch>",
        description: "Change the default branch.",
        controller: setBranch
    },
    {
        cmd: "status",
        description:
            "Status and files changed for src directory.",
        controller: status
    },
    {
        cmd: "test",
        description:
            "Run the test suite for Dot Browser.",
        controller: test
    }
];
