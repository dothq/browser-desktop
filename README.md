# Dot Browser (Desktop)

TODO: You should put branding here

## Development instructions

## Building

First, create a folder to house your application for development:

```bash
mkdir cleandir
cd cleandir
```

Then clone the firefox source code, either via `git clone`:

```bash
git clone --depth 1 https://github.com/mozilla/gecko-dev mozilla-central
```

Clone this repository:

```bash
git clone https://github.com/dothq/browser-desktop
```

Keep track of the location of `mozilla-central`:

```bash
echo $PWD/mozilla-central > browser-desktop/.moz-central
```

Now, we need to add our app to the gecko source code. On linux run:

```bash
# On linux add -r to each of the following commands
ln -s -r browser-desktop/ mozilla-central/dot
ln -s -r browser-desktop/dot.mozconfig mozilla-central/.mozconfig
```

On macos:

```bash
ln -s ../browser-desktop/ mozilla-central/dot
ln -s ../browser-desktop/dot.mozconfig mozilla-central/.mozconfig
```

Apply custom patches:

```bash
cd browser-desktop
./patches.sh import
cd ..
```

Configure and build your application:

```bash
cd mozilla-central
./mach configure
```

Then run it:

```bash
./mach run
```

### Developing the UI

At the same time you have a copy of Gecko running, you need to have a copy of the
UI dev server running. First, after running `./mach build`, run the following
command in the `frontend/ui` folder:

```bash
pnpm i
pnpm hotReloadSymlink
```

> **Note**
>
> You have to run `pnpm hotReloadSymlink` after every time you run `./mach build`
> or `./mach build faster`. However, you do not have to rebuild the browser
> between UI changes, only changes outside of `frontend/ui` need a rebuild

Then, start the webpack dev server:

```bash
pnpm dev
```

This should provide hot reloading in **most** cases. However, if there is an
error in your app, it will freeze and you will have to run `window.location.reload()`
in the devtools to recover.
