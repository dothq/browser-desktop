#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import shutil
import subprocess
import sys
from time import sleep

from genericpath import exists

args = sys.argv[1:]

topsrcdir = ""
patches_dir = ""

cwd = os.getcwd()
dirname = os.path.basename(cwd)

if dirname == "dot":
    patches_dir = os.path.join(cwd, "patches")
    topsrcdir = os.path.abspath("..")
elif os.path.exists(".taskcluster.yml"):
    patches_dir = os.path.join(cwd, "dot", "patches")
    topsrcdir = cwd
else:
    raise Exception("You must be in either the gecko-dev directory or the dot directory to use patchtool.")

HELP_COMMAND = f"""Usage: {sys.argv[0]} <command>

    import:                   Import all Dot Browser patches
    export <pathspec>...:     Exports a file to a .patch file
    edit <patch>:             Manually edit a patch's contents
"""

def import_patches():
    def sort(el):
        num = el.split("-")[0]
        return int(num)

    patches = sorted(os.listdir(patches_dir), key=sort)

    print(f"Importing {len(patches)} patches...\n")

    for i in patches:
        path = os.path.join(patches_dir, i)
        name = os.path.basename(path)

        print(f"----- {name} -----")

        already_applied_code = subprocess.run([
            "git", 
            "apply", 
            "-R", 
            "--check", 
            path
        ], 
            cwd=topsrcdir, 
            stdout=subprocess.DEVNULL, 
            stderr=subprocess.DEVNULL
        ).returncode

        if already_applied_code != 0:
            try:
                subprocess.check_output([
                    "git", 
                    "apply", 
                    "--ignore-whitespace",
                    "--ignore-space-change",
                    "--verbose",
                    path
                ], 
                    cwd=topsrcdir,
                    stderr=subprocess.STDOUT
                )

                print("\033[92mSuccessfully applied.\033[00m")
                print("-----\n")
            except subprocess.CalledProcessError as e:
                output = e.output.decode()
                print(f"\033[91m{output}\033[00m")
                print("-----")
                exit(1)
            except Exception as e:
                output = str(e)
                print(f"\033[91m{output}\033[00m")
                print("-----")
                exit(1)

        else:
            print("\033[93mSkipped as it is already applied.\033[00m")
            print("-----\n")

        sleep(0.2)

def export_patch():
    paths = sys.argv[2:]

    if len(paths) == 0:
        print("No paths specified, nothing exported.")
        exit(1)

    editor = os.path.basename(os.environ.get("EDITOR"))

    sp_paths = " ".join(paths)

    output = subprocess.check_output(f"git diff {sp_paths}".split(" "), cwd=topsrcdir, shell=False).decode("UTF-8")

    if len(output) == 0:
        pre = "s"
        if len(paths) == 1:
            pre = ""

        print(f"No changes to file{pre} found.")
        exit(1)

    print(f"Launching {editor} to add commit message...")

    code = subprocess.call(f"git commit {sp_paths}", cwd=topsrcdir, shell=True)

    if code == 0:
        next_patch_num = len(os.listdir(patches_dir)) + 1

        patch_code = subprocess.run([
            "git", 
            "format-patch",
            "--start-number",
            str(next_patch_num),
            "-1",
            "-o",
            patches_dir
        ], 
            cwd=topsrcdir,
            stderr=subprocess.STDOUT
        )

        if patch_code != 0:
            print("Error occurred in patch creation, undoing commit...")
            subprocess.call("git reset --soft HEAD~1", cwd=topsrcdir, shell=True)
            subprocess.call(f"git restore --staged {sp_paths}", cwd=topsrcdir, shell=True)
    else:
        exit(code)

def edit_patch():
    path = sys.argv[2]

    def sort(el):
        num = el.split("-")[0]
        return int(num)

    patches = sorted(os.listdir(patches_dir), key=sort)

    patch_path = ""

    for i in patches:
        if i.find(path) >= 0:
            patch_path = i

    if len(patch_path) == 0:
        print(f"Unable to find a patch with name '{path}'.")
        exit(1)

    if shutil.which("editdiff") is None:
        print("patchutils is required to be installed in order to run the edit command.")
        exit(1)

    backup_patch = open(os.path.join(patches_dir, patch_path), "r")
    backup_patch_data = backup_patch.read()
    backup_patch.close()

    code = subprocess.call(f"editdiff {patch_path}", cwd=patches_dir, shell=True)

    if exists(os.path.join(patches_dir, f"{patch_path}.orig")):
        os.remove(os.path.join(patches_dir, f"{patch_path}.orig"))

    if code != 0:
        with open(os.path.join(patches_dir, patch_path), "w") as p:
            p.write(backup_patch_data)
            p.close()


def ensure_patch_data_ignored():
    path = os.path.join(topsrcdir, ".gitignore")

    with open(path, "r") as gir:
        if gir.read().find("*.rej") == -1:
            gir.close()
            with open(path, "a") as gia:
                gia.write("\n# Dot Browser: Patch rejection files\n*.rej\n*.orig\n")
                gia.close()

def maybe_write_mozconfig():
    path = os.path.join(topsrcdir, "mozconfig")

    if os.path.exists(path) == False:
        with open(path, "w") as mozc:
            out = """# Dot Browser Build Configuration
    # For a full list of options, see https://developer.dothq.org/contributing/configuring_build_options.html

    # Set build target to Dot Browser (do not remove!)
    ac_add_options --enable-application=dot
    """

            mozc.write(out)
            mozc.close()

def write_post_merge_hook():
    path = os.path.join(topsrcdir, ".git", "hooks", "post-merge")

    with open(path, "w") as pm:
        pm.write("#!/bin/bash\nexec dot/scripts/patchtool.py import\n")
        pm.close()

    mode = os.stat(path).st_mode
    mode |= (mode & 0o444) >> 2
    os.chmod(path, mode)

def write_pre_commit_hook():
    path = os.path.join(topsrcdir, "dot", ".git", "hooks", "pre-commit")

    with open(path, "w") as pm:
        pm.write("#!/bin/bash\nexec scripts/patchtool.py import\n")
        pm.close()

    mode = os.stat(path).st_mode
    mode |= (mode & 0o444) >> 2
    os.chmod(path, mode)

def copy_vscode_config():
    if os.path.exists(os.path.join(topsrcdir, ".vscode")) == False:
        os.makedirs(os.path.join(topsrcdir, ".vscode"))

    shutil.copy(
        os.path.join(topsrcdir, "dot", ".vscode", "settings.json"), 
        os.path.join(topsrcdir, ".vscode", "settings.json")
    )
    
def block_push_to_upstream():
    subprocess.run([
        "git", 
        "remote", 
        "set-url", 
        "origin", 
        "--push", 
        "http://no_push.invalid"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=topsrcdir)

def main():
    # Run housekeeping tasks
    ensure_patch_data_ignored()
    maybe_write_mozconfig()
    write_post_merge_hook()
    write_pre_commit_hook()
    copy_vscode_config()
    block_push_to_upstream()

    if len(args) == 0:
        print(HELP_COMMAND)
        exit()

    if args[0] == "import":
        import_patches()
    elif args[0] == "export":
        export_patch()
    elif args[0] == "edit":
        edit_patch()
    else:
        print(HELP_COMMAND)

    exit()

if __name__ == "__main__":
    main()
