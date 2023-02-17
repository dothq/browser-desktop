# Building Dot Browser on Linux

This document will guide you in setting up a development environment to build and hack on Dot Browser using your Linux machine.

## Introduction

Dot Browser is proudly built on top of the [Mozilla Firefox](https://www.mozilla.org/firefox) web browser, which is why there are many references to Mozilla repositories and code in these documents.

Mozilla, Firefox and the Firefox logo are trademarks of the Mozilla Foundation in the U.S. and other countries.

Dot HQ and Dot Browser are not associated with Mozilla or its products.

## Requirements

Please ensure your system adheres to the following requirements before continuing.

-   At least 4 GB of ram (8 GB is advised)
-   At least 4 CPU cores
-   30.0 GB of free space
-   64-bit operating system

You will also need the following tools installed on your Linux machine to continue:

-   For Debian-based systems (e.g. Ubuntu, Linux Mint, Pop!\_OS, ZorinOS):

    ```sh
    sudo apt-get install build-essential git curl python3 python3-dev python3-pip
    ```

-   For Fedora Linux systems:
    ```sh
    sudo dnf group install "C Development Tools and Libraries" "Development Tools"
    sudo dnf install git curl python3 python3-devel
    ```
-   For Arch Linux systems:
    ```sh
    sudo pacman -S base-devel git curl python
    ```

You will also need the following third-party tools installed:

-   [Rust](https://rustup.rs) - Installing Rustup will also install the Rust Compiler, Cargo and other required tools.

## Cloning the source

The first step is getting the Mozilla source and the Dot Browser source.

We are currently using the `release` branch on the [`gecko-dev`](https://github.com/dothq/gecko-dev).

You can clone the source by substituting the GitHub repository URL of your choice into the command below:

```sh
git clone https://github.com/dothq/gecko-dev
```

This may take a while depending on the speed of your network connection.

Once cloned fully, enter the directory.

```sh
cd gecko-dev/ # Or wherever Git cloned it to
```

Now inside the directory, we will need to clone the Dot Browser source.

You can do this by running:

```sh
git clone https://github.com/dothq/browser-desktop dot/
```

Your directory structure should look something like:

```sh
gecko-dev # Root directory
    - accessible
    - browser
    - build
    - caps
    - ...
    - dot # Dot directory
        - app
        - base
        - branding
        - components
    - editor
    - extensions
    - gfx
    - ...
```

Once cloned, you can either stay in the `gecko-dev` directory to switch into `dot`.

You can now start your IDE or editor and move onto the build step.

## Building the browser

### Installing mach commands

To continue with the next few steps, **you will need** to run the install mach commands script to add some Dot Browser specific tools to the Mozilla build tool.

Assuming you are in the `dot` directory, run the following Python script:

```sh
./scripts/install_mach_commands.py
```

### Importing patches

In order to build Dot Browser correctly, you will need to import a series of patches into Firefox.

Assuming you are in the `dot` directory, run the following `mach` command:

```sh
./mach import-patches
```

This will automate the import process.

If all patches have applied successfully, you shouldn't see any errors onscreen.

**_Note:_** If you are seeing errors and you haven't made any changes to the patch files, please [open an issue](https://github.com/dothq/browser-desktop/issues/news) immediately.

Once all the patches have applied cleanly, verify that your `mozconfig` in the root directory contains the following:

```
ac_add_options --enable-application=dot
```

**_Note:_** There may be other things in the `mozconfig` file, as long as it contains the above string everything is working correctly.

You should be done for the configuration process now, however, if you wish to speed up build times or configure the build further: please refer to the [Configuring Build Options](../configuring_build_options.md) document.

### Compilation

If your system satisfies all of the listed build requirements, you can start a `mach` build by running:

```sh
# You can be in either the `dot` or root directory to use `mach`
./mach build
```

Builds can take upwards from 10 minutes up to several hours, please be patient!

You can speed up build times in future by following the guidance on **sccache** in the [Configuring Build Options](../configuring_build_options.md) document.

### Hacking

Once Dot Browser is built successfully, you will be able to run Dot and start hacking using the following `mach` command:

```sh
# You can be in either the `dot` or root directory to use `mach`
./mach run
```

If you are considering contributing to the Dot Browser open-source project, please read our [Contributors Guide](contributors_guide.md) document as it outlines the procedures for submitting a patch to our repository.

## Updating the repositories

Whenever there is a new change, it is important you pull **BOTH** the Dot Browser source and Firefox source.

Assuming you are in the `dot` directory, this can easily be done by:

```sh
./mach sync
```

You will then need to [rebuild the browser](#compilation) in order to see the newest changes in your build. If there are minute changes, your build could be quite fast. Larger changes will take longer as more is needed to be recompiled.
