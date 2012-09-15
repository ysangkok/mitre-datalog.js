(function(){
"use strict";
var tab = function(id) {
  if (id === "#t1")
    $("#tabcontainer").addClass("taboneactive");
  else
    $("#tabcontainer").removeClass("taboneactive");
};
var jump = function(line,box) {
      box.setCursor(Number(line),0);
      box.setSelection({line:Number(line),ch:0},{line:Number(line)+1,ch:0});
      box.focus();
};

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

var addText = function(elId, text) {
    var obj = document.getElementById(elId);
    var txt = document.createTextNode(text);
    obj.appendChild(txt);
};

var trimLines = function(str) {
    return str.split("\n").map(function(v) {
        return v.trim();
    }).join("\n");
};
var htmlEscape = function(v) {
    return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
var datalogContent, luaContent, queryContent;
var wrapperPreInit = function(FS) {
    //window.FS = FS;
    FS.createDataFile('/', 'datalog.dl', datalogContent, true, false);
    FS.createDataFile('/', 'queries.dl', queryContent, true, false);
    FS.createDataFile('/', 'lib.lua', luaContent, true, false);
}

var assert = function(thing) { if (thing !== true) throw new Error("Assertion failed");};

var example = function(clauses, queries) {
	assert(clauses !== undefined);
	this.clauses = clauses;
	this.queries = queries || "";
};

var data = {
    'ancestor': new example(trimLines("% Equality test\n\
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
    ")),
    'bidipath': new example("% path test from Chen & Warren\nedge(a, b). edge(b, c). edge(c, d). edge(d, a).\npath(X, Y) :- edge(X, Y).\npath(X, Y) :- edge(X, Z), path(Z, Y).\npath(X, Y) :- path(X, Z), edge(Z, Y).\npath(X, Y)?\n"),
    'laps': new example("% Laps Test\ncontains(ca, store, rams_couch, rams).\ncontains(rams, fetch, rams_couch, will).\ncontains(ca, fetch, Name, Watcher) :-\n    contains(ca, store, Name, Owner),\n    contains(Owner, fetch, Name, Watcher).\ntrusted(ca).\npermit(User, Priv, Name) :-\n    contains(Auth, Priv, Name, User),\n    trusted(Auth).\npermit(User, Priv, Name)?\n"),
    'long': new example("abcdefghi(z123456789,\nz1234567890123456789,\nz123456789012345678901234567890123456789,\nz1234567890123456789012345678901234567890123456789012345678901234567890123456789).\n\nthis_is_a_long_identifier_and_tests_the_scanners_concat_when_read_with_a_small_buffer.\nthis_is_a_long_identifier_and_tests_the_scanners_concat_when_read_with_a_small_buffer?\n"),
    'octal': new example("octal(1, \"\\5\").\noctal(2, \"\\7a\").\noctal(3, \"\\79\").\noctal(4, \"\\7531\").\noctal(5, \"a\\7\\n\").\noctal(6, \"a\\3\\3\").\noctal(7, \"\\377\").\noctal(8, \"\\200\").\noctal(X, Y)?\n"),
    'path': new example("% path test from Chen & Warren\nedge(a, b). edge(b, c). edge(c, d). edge(d, a).\npath(X, Y) :- edge(X, Y).\npath(X, Y) :- edge(X, Z), path(Z, Y).\npath(X, Y)?\n"),
    'pq': new example("% p q test from Chen & Warren\nq(X) :- p(X).\nq(a).\np(X) :- q(X).\nq(X)?\n"),
    'revpath': new example("% path test from Chen & Warren\nedge(a, b). edge(b, c). edge(c, d). edge(d, a).\npath(X, Y) :- edge(X, Y).\npath(X, Y) :- path(X, Z), edge(Z, Y).\npath(X, Y)?\n"),
    'says': new example("tpme(tpme1).\nms(m1,'TPME',tpme1,ek,tp).\nsays(TPME,M) :- tpme(TPME),ms(M,'TPME',TPME,A,B).\nsays(A,B)?\n"),
    'tc': new example("% Transitive closure test from Guo & Gupta\n\nr(X, Y) :- r(X, Z), r(Z, Y).\nr(X, Y) :- p(X, Y), q(Y).\np(a, b).  p(b, d).  p(b, c).\nq(b).  q(c).\nr(a, Y)?\n"),
    'true': new example("true.\ntrue?\n"),
    'unequal': new example("pc(2190, 1300, 2, 80, 392).\npc(3289, 1100, 4, 160, 1281).\npc(3288, 1050, 2, 160, 682).\n\n% Finden Sie die Festplattengrößen, die\n% in mindestens zwei PCs vorkommen.\ne(B) :- pc(A, X1, X2, B, X3), pc(C, X4, X5, B, X6), unequal(A,C).\ne(B)?")
};
//for i in *.dl; do python -c "import json; print(\"'$(echo $i| cut -d. -f1)':\" + json.dumps(open('$i').read()));" >> out; done

data["u7"] = new example(get("mitre-u7-clauses.dl"),get("mitre-u7-queries.dl"));


var editor, luaEditor, queryEditor;
var switc = function(v) {
    try {
      editor.setValue(data[v].clauses);
    } catch (err) {
      document.getElementById("datalog").value = data[v].clauses;
    }
    try {
      queryEditor.setValue(data[v].queries);
    } catch (err) {
      document.getElementById("queries").value = data[v].queries;
    }
    if (data[v].queries !== "") tab("#t2");
    execute();
}

var onLoad = function() {
    Object.keys(data).map(function(v) {
      jQuery("#examples").append(jQuery("<li>").append(jQuery("<a href='javascript:void(0);'>").click(function() { switc(v); }).append(v)));
    });

    jQuery("#codeform").submit(function(e) { execute(); });

    jQuery(window).resize(function(e) {
      var val = "calc(" + jQuery("#datalogpane").height() + "px - 2.8em)";
      if (jQuery.browser.webkit) val = "-webkit-" + val;
      else if (jQuery.browser.mozilla) val = "-moz-" + val;
      else if (jQuery.browser.opera) val = "-o-" + val;
      jQuery(editor.getScrollerElement()).css("height", val);
      editor.refresh();
      jQuery(luaEditor.getScrollerElement()).css("height", val);
      luaEditor.refresh();
      jQuery(queryEditor.getScrollerElement()).css("height", val);
      queryEditor.refresh();
      jQuery("#output").css("height", val);
    });

    CodeMirror.commands.autocomplete = function(cm) {
        CodeMirror.simpleHint(cm, CodeMirror.datalogHint);
    }

    var lineNum = true, theme = "lesser-dark";
    editor = CodeMirror.fromTextArea(document.getElementById("datalog"), {
        mode: "datalog",
        lineNumbers: lineNum,
        theme: theme,
        extraKeys: {"Ctrl-Space": "autocomplete"}
    });
    queryEditor = CodeMirror.fromTextArea(document.getElementById("queries"), {
        mode: "datalog",
        lineNumbers: lineNum,
        theme: theme,
        extraKeys: {"Ctrl-Space": "autocomplete"}
    });
    luaEditor = CodeMirror.fromTextArea(document.getElementById("lua"), {
        mode: "lua",
        lineNumbers: lineNum,
        theme: theme
    });
    luaEditor.setValue(get("default.lua"));
    document.getElementById("submitbutton").disabled = false;
    switc("ancestor");
    window.setTimeout(function() {jQuery(window).resize()}, 0);
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

    var Module = {};
    //Module["noExitRuntime"] = true;
    Module["noInitialRun"] = true;
    Module["print"] = function(v) {
        addText("output", v + "\n");
    };
    Module["arguments"] = ['-i', '-l', '/lib.lua', '/datalog.dl', '/queries.dl'];
    var fileToBox = {'/lib\\.lua': luaEditor, '/datalog\\.dl': editor, '/queries\\.dl': queryEditor};
    Module = CompiledModule(Module,wrapperPreInit);
    document.getElementById("output").innerHTML = "";
    var rc = Module["run"]();
    jQuery("#output")[(rc === 0) ? "removeClass" : "addClass"]("error");
    if (rc !== 0) {
      // find error line and highlight
      Object.keys(fileToBox).map(function(v) {
        var re = new RegExp(v + ":(\\d+)");
        var arr = document.getElementById("output").innerHTML.match(re); // ["/datalog.dl:12", "12"] 
        if (arr === null) return; //throw new Error("Could not find error line number");
        jump(Number(arr[1])-1,fileToBox[v]);
      });
    }
    document.getElementById("submitbutton").disabled = false;
    return false;
};

window["tab"] = tab;

jQuery(document).ready(onLoad);
})();
