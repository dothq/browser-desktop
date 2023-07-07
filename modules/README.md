# Modules

Modules that have been written by *us* will typically have "Dot" prepended to the module name and export.

This is because we don't want to cause disruption and disparity with existing modules, especially since some `toolkit` code relies on a error from a `importESModule` to determine if the module can be used. If we were to re-use the same module name as a `browser` module, our APIs wouldn't line up with what is expected, causing problems.