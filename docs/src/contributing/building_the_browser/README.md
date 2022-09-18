# Building Dot Browser

This document outlines how to build Dot Browser. It is expected you have cloned the source and are in the `dot` directory.

## Build Requirements

Please ensure your system adheres to these requirements and (if listed) any OS-specific requirements.

* At least 4 GB of RAM (8 GB is advised)
* At least 4 CPU cores
* [Windows Build Requirements](windows.md)
* [Linux Build Requirements](linux.md)
* [macOS Build Requirements](macos.md)

## Build Configuration

In order to build Dot Browser correctly, you will need to import a series of patches into Firefox.

This can be easily done by running the `patchtool.py` script.

Assuming you are in the `dot` directory, run the following script:

```sh
# You may need to prepend python3 if the script does not run
./scripts/patchtool.py import
```

This will automate the import process.

If all patches have applied successfully, you shouldn't see any errors onscreen. 

***Note:*** If you are seeing errors and you haven't made any changes to the patch files, please [open an issue](https://github.com/dothq/browser-desktop/issues/news) immediately.

Once all the patches have applied cleanly, verify that your `mozconfig` in the root directory contains the following:

```
ac_add_options --enable-application=dot
```

You should be done for the configuration process now, however, if you wish to speed up build times or configure the build further: please refer to the [Configuring Build Options](../configuring_build_options.md) document.

## Building

If your system satisfies all the build requirements, you can start a `mach` build by running:

***Note*** If you are building on Windows, please ensure you are in **the Mozillabuild shell environment** before running `mach` or you will run into errors! See [Windows Build Requirements](windows.md) for more information.

```sh
# You can be in either the `dot` or root directory to use `mach`
./mach build
```

Builds can take upwards from 10 minutes up to several hours, please be patient!

You can speed up build times in future by following the guidance on **sccache** in the [Configuring Build Options](../configuring_build_options.md) document.

## Hacking

Once Dot Browser is built successfully, you will be able to run Dot and start hacking using the following `mach` command:

```sh
# You can be in either the `dot` or root directory to use `mach`
./mach run
```

If you are considering contributing to the Dot Browser open-source project, please read our [Contributors Guide](contributors_guide.md) document as it outlines the procedures for submitting a patch to our repository.

## Updating the repositories

Whenever there is a new change, it is important you pull **BOTH** the Dot Browser source and Firefox source.

This can be done by either doing:

### In the `dot/` directory

```sh
cd ..
git pull
cd dot
git pull
```

### In the Firefox source directory

```sh
git pull
cd dot
git pull
cd ..
```

You will then need to [rebuild the browser](#building) in order to see the newest changes in your build. If there are minute changes, your build could be quite fast. Larger changes will take longer as more is needed to be recompiled.