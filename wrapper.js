var get = function(url) {
    var outerRes;
    jQuery.ajax({
        url: url,
        success: function(result) {
            outerRes = result;
        },
        async: false,
        dataType: "text"
    });
    return outerRes;
};

function addText(elId, text) {
    var obj = document.getElementById(elId);
    var txt = document.createTextNode(text);
    obj.appendChild(txt);
}

function trimLines(str) {
    return str.split("\n").map(function(v) {
        return v.trim();
    }).join("\n");
}
var htmlEscape = function(v) {
    return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
var fileContent;
var Module = {};
//Module["noExitRuntime"] = true;
Module["noInitialRun"] = true;
Module["print"] = function(v) {
    addText("output", v + "\n");
};
Module["arguments"] = ['-l', '/lib.lua', '/datalog.dl'];
window["wrapperPreInit"] = function(FS) {
    //window.FS = FS;
    FS.createDataFile('/', 'datalog.dl', fileContent, true, false);
    FS.createDataFile('/', 'lib.lua', get("default.lua"), true, false);
}
var data = {
    'ancestor': trimLines("% Equality test\n\
		ancestor(A, B) :-\n\
		    parent(A, B).\n\
		ancestor(A, B) :-\n\
		    parent(A, C),\n\
		    D = C,      % Unification required\n\
		    ancestor(D, B).\n\
		parent(john, douglas).\n\
		parent(bob, john).\n\
		parent(ebbon, bob).\n\
		ancestor(A, B)?\n\
	"),
    'bidipath': "% path test from Chen & Warren\nedge(a, b). edge(b, c). edge(c, d). edge(d, a).\npath(X, Y) :- edge(X, Y).\npath(X, Y) :- edge(X, Z), path(Z, Y).\npath(X, Y) :- path(X, Z), edge(Z, Y).\npath(X, Y)?\n",
    'laps': "% Laps Test\ncontains(ca, store, rams_couch, rams).\ncontains(rams, fetch, rams_couch, will).\ncontains(ca, fetch, Name, Watcher) :-\n    contains(ca, store, Name, Owner),\n    contains(Owner, fetch, Name, Watcher).\ntrusted(ca).\npermit(User, Priv, Name) :-\n    contains(Auth, Priv, Name, User),\n    trusted(Auth).\npermit(User, Priv, Name)?\n",
    'long': "abcdefghi(z123456789,\nz1234567890123456789,\nz123456789012345678901234567890123456789,\nz1234567890123456789012345678901234567890123456789012345678901234567890123456789).\n\nthis_is_a_long_identifier_and_tests_the_scanners_concat_when_read_with_a_small_buffer.\nthis_is_a_long_identifier_and_tests_the_scanners_concat_when_read_with_a_small_buffer?\n",
    'octal': "octal(1, \"\\5\").\noctal(2, \"\\7a\").\noctal(3, \"\\79\").\noctal(4, \"\\7531\").\noctal(5, \"a\\7\\n\").\noctal(6, \"a\\3\\3\").\noctal(7, \"\\377\").\noctal(8, \"\\200\").\noctal(X, Y)?\n",
    'path': "% path test from Chen & Warren\nedge(a, b). edge(b, c). edge(c, d). edge(d, a).\npath(X, Y) :- edge(X, Y).\npath(X, Y) :- edge(X, Z), path(Z, Y).\npath(X, Y)?\n",
    'pq': "% p q test from Chen & Warren\nq(X) :- p(X).\nq(a).\np(X) :- q(X).\nq(X)?\n",
    'revpath': "% path test from Chen & Warren\nedge(a, b). edge(b, c). edge(c, d). edge(d, a).\npath(X, Y) :- edge(X, Y).\npath(X, Y) :- path(X, Z), edge(Z, Y).\npath(X, Y)?\n",
    'says': "tpme(tpme1).\nms(m1,'TPME',tpme1,ek,tp).\nsays(TPME,M) :- tpme(TPME),ms(M,'TPME',TPME,A,B).\nsays(A,B)?\n",
    'tc': "% Transitive closure test from Guo & Gupta\n\nr(X, Y) :- r(X, Z), r(Z, Y).\nr(X, Y) :- p(X, Y), q(Y).\np(a, b).  p(b, d).  p(b, c).\nq(b).  q(c).\nr(a, Y)?\n",
    'true': "true.\ntrue?\n",
};
//for i in *.dl; do python -c "import json; print(\"'$(echo $i| cut -d. -f1)':\" + json.dumps(open('$i').read()));" >> out; done

data["u7"] = get("mitre-u7.dl");


var editor;
var onLoad = function() {
    editor = CodeMirror.fromTextArea(document.getElementById("datalog"), {
        mode: "clike",
        lineNumbers: true
    });

    switc("ancestor");

};
var submit = function() {
    if (document.getElementById("submitbutton").disabled) throw new Error("disabled!");
    document.getElementById("submitbutton").disabled = true;
    fileContent = editor.getValue();
    var Module = CompiledModule();
    document.getElementById("output").innerHTML = "";
    var rc = Module["run"]();
    document.getElementById("output").style.color = (rc === 0) ? "inherit" : "red";
    document.getElementById("submitbutton").disabled = false;
};

function switc(v) {
    editor.setValue(data[v]);
    submit();
}
