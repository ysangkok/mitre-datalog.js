function tab(id) {
  if (id === "#t1")
    $("#tabcontainer").addClass("taboneactive");
  else
    $("#tabcontainer").removeClass("taboneactive");
}
var jump = function(line) {
      editor.setCursor(Number(line),0);
      editor.setSelection({line:Number(line),ch:0},{line:Number(line)+1,ch:0});
      editor.focus();
}

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
    $("#" + elId).append(text.replace("\n","<br>"))
/*
    var obj = document.getElementById(elId);
    var txt = document.createTextNode(text);
    obj.appendChild(txt);
*/
}

function trimLines(str) {
    return str.split("\n").map(function(v) {
        return v.trim();
    }).join("\n");
}
var htmlEscape = function(v) {
    return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
var datalogContent, luaContent, queryContent;
var Module = {};
//Module["noExitRuntime"] = true;
Module["noInitialRun"] = true;
Module["print"] = function(v) {
    addText("output", v + "\n");
};
Module["arguments"] = ['-i', '-l', '/lib.lua', '/datalog.dl', '/queries.dl'];
window["wrapperPreInit"] = function(FS) {
    //window.FS = FS;
    FS.createDataFile('/', 'datalog.dl', datalogContent, true, false);
    FS.createDataFile('/', 'queries.dl', queryContent, true, false);
    FS.createDataFile('/', 'lib.lua', luaContent, true, false);
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


var editor, luaEditor, queryEditor;
var onLoad = function() {
    jQuery("#codeform").submit(function(e) { execute(); });

    jQuery(window).resize(function(e) {
      var val = "calc(" + $("#datalogpane").height() + "px - 2.6em)";
      if (jQuery.browser.webkit) val = "-webkit-" + val;
      $(editor.getScrollerElement()).css("height", val);
      $(luaEditor.getScrollerElement()).css("height", val);
      $(queryEditor.getScrollerElement()).css("height", val);
    });

    editor = CodeMirror.fromTextArea(document.getElementById("datalog"), {
        mode: "clike",
        lineNumbers: true
    });
    queryEditor = CodeMirror.fromTextArea(document.getElementById("queries"), {
        mode: "clike",
        lineNumbers: true
    });
    luaEditor = CodeMirror.fromTextArea(document.getElementById("lua"), {
        mode: "lua",
        lineNumbers: true
    });
    luaEditor.setValue(get("default.lua"));
    $(window).resize();
    document.getElementById("submitbutton").disabled = false;
    switc("ancestor");
};
var execute = function() {
    if (document.getElementById("submitbutton").disabled) throw new Error("disabled!");
    document.getElementById("submitbutton").disabled = true;
    try {
      datalogContent = editor.getValue();
    } catch (err) {
      datalogContent = document.getElementById("datalog").value;
    }
    try {
      luaContent = luaEditor.getValue();
    } catch (err) {
      luaContent = document.getElementById("lua").value;
    }
    try {
      queryContent = queryEditor.getValue();
    } catch (err) {
      queryContent = document.getElementById("queries").value;
    }
    var Module = CompiledModule();
    document.getElementById("output").innerHTML = "";
    var rc = Module["run"]();
    document.getElementById("output").style.color = (rc === 0) ? "inherit" : "red";
    if (rc !== 0) {
      // find error line and highlight
      var re = /\/datalog.dl:(\d+)/;
      var arr = document.getElementById("output").innerHTML.match(re); // ["/datalog.dl:12", "12"] 
      jump(Number(arr[1])-1);
    }
    document.getElementById("submitbutton").disabled = false;
    return false;
};

function switc(v) {
    try {
      editor.setValue(data[v]);
    } catch (err) {
      document.getElementById("datalog").value = data[v];
    }
    execute();
}

