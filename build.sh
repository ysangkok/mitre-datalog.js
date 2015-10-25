wget -O - "http://downloads.sourceforge.net/project/datalog/datalog/2.2/datalog-2.2.tar.gz" | tar xz
cd datalog-2.2
patch try.sh     < ../jsify_tests.patch
patch interp.c   < ../force_cmdline_param.patch
patch lua/lua.c  < ../rename_lua_main.patch
patch lua/luac.c < ../rename_luac_main.patch
emconfigure ./configure && make
chmod +x bin2c
make
ln -s datalog datalog.bc
emcc -O2 --pre-js ../prejs.js -o datalog.js datalog.bc
chmod +x try.sh
./try.sh || echo "Tests failed!"
cd ..
./wrap.sh

