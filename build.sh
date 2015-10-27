#!/usr/bin/zsh -ex
setopt rcquotes
git submodule update
cd datalog
git clean -f
git checkout .
patch try.sh     < ../jsify_tests.patch
patch interp.c   < ../force_cmdline_param.patch
patch lua/lua.c  < ../rename_lua_main.patch
patch lua/luac.c < ../rename_luac_main.patch
autoreconf -ivf
. ../emsdk_portable/emsdk_env.sh
#echo "EXPORTED_FUNCTIONS=['_johnmandog']" | python3 -c 'import os,sys,subprocess,shlex; p = subprocess.Popen(["emconfigure","./configure"], env=dict(os.environ, EMMAKEN_CFLAGS="-s " + shlex.quote(sys.stdin.read()))); p.communicate(); sys.exit(p.returncode)'
emconfigure ./configure CFLAGS="-s BUILD_AS_WORKER=1"
#emconfigure ./configure CFLAGS="-s BUILD_AS_WORKER=1"
#echo "EXPORTED_FUNCTIONS=['_johnmandog']" | python3 -c 'import os,sys,subprocess,shlex; p = subprocess.Popen(["make"], env=dict(os.environ, EMMAKEN_CFLAGS="-s " + shlex.quote(sys.stdin.read()))); p.communicate(); sys.exit(p.returncode)' || true
make || true
gcc -o bin2c bin2c.c
#echo "EXPORTED_FUNCTIONS=['_johnmandog']" | python3 -c 'import os,sys,subprocess,shlex; p = subprocess.Popen(["make"], env=dict(os.environ, EMMAKEN_CFLAGS="-s " + shlex.quote(sys.stdin.read()))); p.communicate(); sys.exit(p.returncode)'
make
ln -s datalog datalog.bc
emcc -s BUILD_AS_WORKER=1 -s EXPORTED_FUNCTIONS="['_johnmandog']" -O1 -o datalog.js datalog.bc
chmod +x try.sh
#./try.sh || echo "Tests failed!"
cd ..
#./wrap.sh
emcc -s EXPORTED_FUNCTIONS="['_schedule_run']" main.c -Weverything -o main.js --pre-js prejs.js
