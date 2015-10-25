Instructions
------------

Run `build.sh` or do the following:

1. ``git clone <repository git url>``
1. ``cd datalog.js``
1. ``wget -O - "http://downloads.sourceforge.net/project/datalog/datalog/2.2/datalog-2.2.tar.gz" | tar xz``
1. ``cd datalog-2.2``
1. ``patch try.sh < ../jsify_tests.patch``
1. ``patch interp.c < ../force_cmdline_param.patch``
1. ``patch lua/lua.c < ../rename_lua_main.patch``
1. ``patch lua/luac.c < ../rename_luac_main.patch``
1. ``emconfigure ./configure && make``
1. ``chmod +x bin2c``
1. ``make``
1. ``ln -s datalog datalog.bc``
1. ``emcc -O2 --pre-js ../prejs.js -o datalog.js datalog.bc``
1. ``chmod +x try.sh``
1. ``./try.sh || echo "Tests failed!"``
1. ``cd ..``
1. ``./wrap.sh``
