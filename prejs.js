try {
	Module;
	if (typeof Module === "undefined") throw new Error();
} catch (err) {
	Module = {}; // NB: Module global
}
Module["preInit"] = function() {
	wrapperPreInit(FS);
};
