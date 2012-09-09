if (!Module) Module = {};
Module["preInit"] = function() { window["wrapperPreInit"]({"createDataFile":FS.createDataFile}); };
