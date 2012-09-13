Instructions
------------

1. ``git clone <repository git url>``
1. ``cd datalog.js``
1. ``wget -O - "http://downloads.sourceforge.net/project/datalog/datalog/2.2/datalog-2.2.tar.gz" | tar xz``
1. ``cd datalog-2.2``
1. ``patch try.sh < ~/Downloads/datalog.js/jsify_tests.patch``
1. ``patch interp.c < ~/Downloads/datalog.js/force_cmdline_param.patch``
1. ``patch lua/lua.c < ~/Downloads/datalog.js/rename_lua_c_main.patch``
1. ``patch lua/luac.c < ~/Downloads/datalog.js/rename_lua_c_main.patch``
1. ``emconfigure ./configure && make``
1. ``chmod +x bin2c``
1. ``make``
1. ``ln -s datalog datalog.bc``
1. ``emcc -O2 --pre-js ../prejs.js -o datalog.js datalog.bc``
1. ``./try.sh``
1. ``cd ..``
1. ``./wrap.sh``
