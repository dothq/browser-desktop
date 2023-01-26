# Dot Browser patches

All the patches used in Dot Browser to make tweaks and changes to Firefox/Gecko.

We should avoid making new patches if at all possible, as it creates conflict hell when pulling from `gecko-dev`.

Patches are meant to be small, individual file modifications - if you are having to create patches that include multiple modified files then an alternative approach is needed.

## Creating a new patch

You should read the [Contributors Guide](https://developer.dothq.org/contributing/contributors_guide.html) for instructions on how to create a new patch.

## Phasing out a patch

Phasing out (removing) a patch should only be done by core maintainers as it can cause problems if not done safely.

Only patches in the [`removed`](./removed/) prefixed with `!` will be automatically reverted by patchtool, this is to ensure automatic reversion is only performed on an opt-in basis.
