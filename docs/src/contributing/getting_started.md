# Getting Started

This document will guide you in setting up a development environment to build and hack on Dot Browser.

## Introduction

Dot Browser is proudly built on top of the [Mozilla Firefox](https://mozilla.org/firefox) web browser, which is why there are many references to Mozilla repositories and code in these documents.

Mozilla, Firefox and the Firefox logo are trademarks of the Mozilla Foundation in the U.S. and other countries.

Dot HQ and Dot Browser are not associated with Mozilla or its products.

## Requirements

Please ensure your system adheres to the following requirements before continuing.

-   At least 4 GB of ram (8 GB is advised)
-   30.0 GB of free space
-   64-bit operating system
-   Git SCM

## Cloning the source

The first step is getting the Mozilla source and the Dot Browser source.

There are two branches on [`gecko-dev`](https://github.com/mozilla/gecko-dev) we recommend to use as a base.

-   [release](https://github.com/mozilla/gecko-dev/tree/release) - A more stable, release branch of `mozilla-central`.
-   [master](https://github.com/mozilla/gecko-dev/tree/master) - The bleeding-edge, nightly branch of `mozilla-central`.

**_Note_** For faster clones append `--depth=5` to the command. This will only fetch the last 5 commits.

You can clone the source by substituting the GitHub repository URL of your choice into the command below:

```sh
git clone https://github.com/mozilla/gecko-dev -b <branch of choice>
```

For example: `git clone https://github.com/mozilla/gecko-dev -b release`.

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
    - browser
    - build
    - dot # Dot directory
        - app
        - base
        - branding
        - components
```

Once cloned, you can either stay in the `gecko-dev` directory to switch into `dot`.

You can now start your IDE or editor and move onto the build step.
