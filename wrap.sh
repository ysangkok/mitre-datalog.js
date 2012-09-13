#!/bin/bash -ex
cd datalog-2.2
cat datalog.js | sed -re '1s/^/var CompiledModule = function() {/' > tmp.js
echo -ne "\nreturn Module;\n};" >> tmp.js
mv tmp.js datalog.js
