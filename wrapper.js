(function(){
"use strict";
  function QueryableWorker (sURL, fDefListener, fOnError) {
    var oInstance = this, oWorker = new Worker(sURL), oListeners = {};
    this.defaultListener = fDefListener || function () {};
    oWorker.onmessage = function (oEvent) {
      if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty("vo42t30") && oEvent.data.hasOwnProperty("rnb93qh")) {
        oListeners[oEvent.data.vo42t30].apply(oInstance, oEvent.data.rnb93qh);
      } else {
        this.defaultListener.call(oInstance, oEvent.data);
      }
    };
    if (fOnError) { oWorker.onerror = fOnError; }
    this.sendQuery = function () {
      if (arguments.length < 1) { throw new TypeError("QueryableWorker.sendQuery - not enough arguments"); return; }
      oWorker.postMessage({ "bk4e1h0": arguments[0], "ktp3fm1": Array.prototype.slice.call(arguments, 1) });
    };
    this.postMessage = function (vMsg) {
      Worker.prototype.postMessage.call(oWorker, vMsg);
    };
    this.terminate = function () {
      Worker.prototype.terminate.call(oWorker);
    };
    this.addListener = function (sName, fListener) {
      oListeners[sName] = fListener;
    };
    this.removeListener = function (sName) {
      delete oListeners[sName];
    };
  };
 
  var getWorkerTask = (function(fin){var slist = [];
  var runList = function (remaining,list) {
    if (remaining.length == 0) { fin(new QueryableWorker((window.webkitURL ? webkitURL : URL).createObjectURL(new Blob(list)) )); return; } // , yourDefaultMessageListenerHere (optional), yourErrorListenerHere (optional)
    var oScript = remaining[0];
    if ($(oScript).attr("src") !== undefined) {
      jQuery.ajax( {
        url: $(oScript).attr("src"),
        success: function(data){
          list.push(data);
          runList(remaining.slice(1),list);
        },
        dataType:"text"
      });
    } else {
      list.push(oScript.textContent);
      runList(remaining.slice(1),list);
    }
  };
  runList(Array.prototype.slice.call(document.querySelectorAll("script[type=\"text\/js-worker\"]")),slist);
  });









var tab = function(id,container) {
  if (id === "t1")
    jQuery(container).addClass("taboneactive");
  else
    jQuery(container).removeClass("taboneactive");
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
//window.geteditor = function() { return editor; };
var switc = function(v) {
    var oldPos = $($("#luapane").children()[0]).offset();
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
    if (data[v].queries !== "") tab("t2");
    execute(oldPos);
}

var task;

var onLoad = function() {
    CodeMirror.commands.autocomplete = function(cm) {
        CodeMirror.simpleHint(cm, CodeMirror.datalogHint);
    }
    var lineNum = true;
    var editormap = function() { return {"datalog": editor, "lua":luaEditor, "query": queryEditor}; };
    editor = CodeMirror.fromTextArea(document.getElementById("datalog"), {
        mode: "datalog",
        lineNumbers: lineNum,
        extraKeys: {"Ctrl-Space": "autocomplete"},
        onChange: function() {window["editorOnChange"](arguments[0], arguments[1], editormap());}
    });
    queryEditor = CodeMirror.fromTextArea(document.getElementById("queries"), {
        mode: "datalog",
        lineNumbers: lineNum,
        extraKeys: {"Ctrl-Space": "autocomplete"},
        onChange: function() {window["editorOnChange"](arguments[0], arguments[1], editormap());}
    });
    luaEditor = CodeMirror.fromTextArea(document.getElementById("lua"), {
        mode: "lua",
        lineNumbers: lineNum,
        onChange: function() {window["editorOnChange"](arguments[0], arguments[1], editormap());}
    });


  getWorkerTask(function(mytask) {
    task = mytask;
    $(".body").scroll(function(){
      $('.qtip').each(function(){
        $(this).qtip('hide')
      });
    });

    var input = document.getElementById("select");
    var selectTheme = function() {
      var theme = input.options[input.selectedIndex].innerHTML;
      [editor,luaEditor,queryEditor].map(function(v){v.setOption("theme", theme);});
      document.getElementsByTagName("body")[0].id=theme;
      var dir = {};
      ["ambiance", "blackboard", "cobalt", "erlang-dark", "lesser-dark", "monokai", "night", "rubyblue", "vibrant-ink", "xq-dark"].map(function(v){dir[v]="dark";}); 
      ["eclipse", "elegant", "neat"].map(function(v){dir[v]="light";});
      document.getElementsByTagName("body")[0].className=dir[theme];
    };
    input.onchange = input.onkeyup = selectTheme;

    Object.keys(data).map(function(v) {
      jQuery("#examples").append(jQuery("<li>").append(jQuery("<a href='javascript:void(0);'>").click(function() { switc(v); }).append(v)));
    });

    jQuery("#codeform").submit(function(e) { execute($($("#luapane").children()[0]).offset()); });

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
      jQuery(".outputtab").css("height", val);
    });

    luaEditor.setValue(get("default.lua"));
    document.getElementById("submitbutton").disabled = false;
    input.onchange();
    switc("ancestor");
  });
};

var tableOutput;

function tableOutputHandler() {
    this.firstRowOut = false;
    this.newQuery = function (q) {
      $("#tableoutput table:last").tablesorter(); //.stupidtable();
      $("#tableoutput").append($("<h3>").append(q));
      this.firstRowOut = false;
    };
    this.newComment = function (c) {
      $("#tableoutput").append($("<pre>").append(c));
    };
    this.newRow = function (arr) {
      if (!this.firstRowOut) {
        var thead = $("<thead>");
        var tr = $("<tr>"); thead.append(tr);
        $("#tableoutput").append($("<table>").append(thead).append("<tbody>"));
        var i = 1;
        arr.map(function(v){tr.append($("<th>").append("column " + i++));});
        this.firstRowOut = true;
      }
      var tr = $("<tr>");
      arr.map(function(v) {
        tr.append($("<td>").append(v));
      });
      $("#tableoutput table:last tbody").append(tr);

    };
    $("#tableoutput").html("");
}

var distributeOutput = function(v) {
    //console.log(v);
    var pat1 = "% QUERY ";
    var pat2 = "% TSV ";
    if (v.substr(0,pat1.length) === pat1) {
      v = v.substr(pat1.length);
      if (v.trim() === "") return;
      if (v.substr(0,1) === "%") tableOutput.newComment(v);
      else tableOutput.newQuery(v);
      v = "% " + v;
    } else if (v.substr(0,pat2.length) === pat2) {
      v = v.substr(pat2.length);
      tableOutput.newRow(v.split("\t"));
      return;
    }
    addText("output", v + "\n");
};

var qtipcount = 0;

var execute = function(oldPos) {
    if (document.getElementById("submitbutton").disabled) throw new Error("disabled!");
    document.getElementById("submitbutton").disabled = true;

    $("body").removeClass("twocolumnlayout");

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

    var timer = null;

    task.addListener("print",function(v) {
        distributeOutput(v);
        if (timer != null) {
          clearTimeout(timer);
          timer = null;
        }
        timer = window.setTimeout(function() {
          //console.log("fired!");
          jQuery(window).resize()
          window.setTimeout(function() {
            var newPos = $($("#luapane").children()[0]).offset();
            if (newPos.top > oldPos.top) {
              console.log("reflow!");
              $("body").addClass("twocolumnlayout");
              if (qtipcount++ < 2) $(".footer").qtip({content: {text:"It's down here :)",title:{text:"Where'd my code go?",button:true}},position:{adjust: {x: 50,y:25},my:'bottom left', at: 'top left'},show:{effect: function(offset){$(this).fadeIn(200);},event:false,ready:true},hide:false,style: {classes: 'ui-tooltip-shadow ui-tooltip-bootstrap'}});
            } else if (newPos.top < oldPos.top) {
              $("body").removeClass("twocolumnlayout");
            }
          }, 500);
        }, 1000);
    });
    var fileToBox = {'/lib\\.lua': luaEditor, '/datalog\\.dl': editor, '/queries\\.dl': queryEditor};
    document.getElementById("output").innerHTML = "";
    tableOutput = new tableOutputHandler();
    task.addListener("runFinished",function(rc){
    $("#tableoutput table:last").tablesorter(); //.stupidtable();
    jQuery("#output")[(rc === 0) ? "removeClass" : "addClass"]("error");
    tab("t1","#outputtabcontainer");
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
    });
    task.sendQuery('runDatalog',datalogContent,luaContent,queryContent);
    return false;
};

window["tab"] = tab;

jQuery(document).ready(onLoad);
})();
