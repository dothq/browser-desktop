var require = (path) => {
    const resolved = new URL(path, __ESM_DB_IMPORT_ROOT__).href;

    const mod = {};

    Services.scriptloader.loadSubScript(resolved, mod);

    return mod;
}

var module = {
    exports: {}
};