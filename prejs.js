try {
	Module;
	if (typeof Module === "undefined") throw new Error();
} catch (err) {
	Module = {}; // NB: Module global
}
Module["preInit"] = function() {
	try {
		wrapperPreInit({"createDataFile":FS.createDataFile}); 
	} catch (err) {
		var nfs = require("fs");
                FS.createDataFile('/', process["argv"][4], nfs["readFileSync"](process["argv"][4], "utf-8"), true, false);
                FS.createDataFile('/', process["argv"][3], nfs["readFileSync"](process["argv"][3], "utf-8"), true, false);
	}
};
