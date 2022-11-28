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

    # Ensure we are only importing .patch files
    patches = [i for i in patches if i.endswith(".patch")]

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

    patch_file_path = ""

    def declare_patch_error():
        print("Error occurred in patch creation, aborting...")
        try:
            subprocess.call("git reset HEAD~", cwd=topsrcdir, shell=True)
        except:
            print("WARNING: Could not undo patch commit. You will need to undo the last commit yourself.")
        try:
            subprocess.call(f"git restore --staged {sp_paths}", cwd=topsrcdir, shell=True)
        except:
            print(f"WARNING: Could not unstage files with pattern {sp_paths}. You will need to unstage these files yourself.")
        try:
            if len(patch_file_path) == 0:
                raise Exception()

            patch_file = [
                filename for filename in os.listdir(patches_dir) 
                if filename.startswith(f"{str(next_patch_num).zfill(4)}-")
            ]
            os.remove(patch_file_path)
        except:
            print("WARNING: Could not delete generated patch file. You will need to remove this yourself.")
        exit(1)

    if code == 0:
        try:
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

            patch_file_name = [
                filename for filename in os.listdir(patches_dir) 
                if filename.startswith(f"{str(next_patch_num).zfill(4)}-")
            ]
            patch_file_path = os.path.join(patches_dir, patch_file_name[0])

            if patch_code == 1:
                declare_patch_error()

            if os.path.exists(patch_file_path):
                undo_commit_code = subprocess.call("git reset HEAD~", cwd=topsrcdir, shell=True)
            
                if undo_commit_code == 1:
                    declare_patch_error()
            else:
                exit(1)
        except:
            declare_patch_error()
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

    def undo_edit_patch():
        print("Your patch could not be applied. Undoing changes...")

        with open(os.path.join(patches_dir, patch_path), "w") as p:
            p.write(backup_patch_data)
            p.close()

            if exists(os.path.join(patches_dir, f"{patch_path}.orig")):
                os.remove(os.path.join(patches_dir, f"{patch_path}.orig"))

    # If editing the patch was successful, try undo the current version of the patch
    if code == 0:
        try:
            subprocess.check_output([
                "git", 
                "apply", 
                "-R",
                "--ignore-whitespace",
                "--ignore-space-change",
                "--verbose",
                os.path.join(patches_dir, f"{patch_path}.orig")
            ], 
                cwd=topsrcdir,
                stderr=subprocess.STDOUT
            )

            # Remove the original patch file as we don't need it anymore
            os.remove(os.path.join(patches_dir, f"{patch_path}.orig"))
        except subprocess.CalledProcessError as e:
            pass
    else:
        # If there is an error undoing the current patch, revert our patch edit
        undo_edit_patch()
        exit(1)

    # Attempt to reimport all the patches to ensure the patch applies cleanly
    import_patches()

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
    dot_path = os.path.join(topsrcdir, "dot", "mozconfig")

    if os.path.exists(path) == False:
        with open(path, "w") as mozc:
            out = """# Dot Browser Build Configuration
# For a full list of options, see https://developer.dothq.org/contributing/configuring_build_options.html

# Important: do not remove.
. "$topsrcdir/dot/config/mozconfigs/common"

# Add your build options below:\n"""

            mozc.write(out)
            mozc.close()

    if os.path.exists(dot_path) == False:
        os.symlink(path, dot_path)

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
