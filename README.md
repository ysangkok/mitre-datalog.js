Instructions
------------

1. ``git clone <repository git url>``
1. ``cd datalog.js``
1. ``wget -O - "http://downloads.sourceforge.net/project/datalog/datalog/2.2/datalog-2.2.tar.gz?r=http%3A%2F%2Fsourceforge.net%2Fprojects%2Fdatalog%2F&ts=1347185632&use_mirror=switch" | tar xz``
1. ``cd datalog-2.2``
1. ``patch interp.c < ~/Downloads/datalog.js/force_cmdline_param.patch``
1. ``patch lua/lua.c < ~/Downloads/datalog.js/rename_lua_c_main.patch``
1. ``patch lua/luac.c < ~/Downloads/datalog.js/rename_lua_c_main.patch``
1. ``emconfigure ./configure && make``
1. ``chmod +x bin2c``
1. ``make``
1. ``ln datalog datalog.bc``
1. ``emcc -O2 --pre-js prejs.js -o datalog.js datalog.bc``
1. ``cat datalog.js | sed -re '1s/^/var CompiledModule = function() {/' > tmp.js``
1. ``echo -ne "\nreturn Module;\n};" >> tmp.js``
1. ``mv tmp.js datalog.js``
1. ``js datalog.js``
