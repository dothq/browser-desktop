# Configuring Build Options

The `mozconfig` file located in the root is used to configure and set-up the Mozilla Build System. There are many different options you can tweak and modify to achieve different results. It is important you are aware what each option does before using in your `mozconfig` file as different options can drastically change your build result.

## Option types

There are two different ways of applying an option to the build.

* `mk_add_options` - Options under this category will be passed to the `client.mk` Makefile.
* `ac_add_options` - Options under this category are passed to `configure`.

### Common options

#### sccache

[sccache](https://github.com/mozilla/sccache) is a solution developed by Mozilla to cache compilation results. sccache is very similar to [ccache](https://ccache.dev) but sccache supports caching within Rust builds.

You can enable sccache by adding `ac_add_options --with-ccache=sccache` to your `mozconfig` file.

***Note*** This section is a work in progress.