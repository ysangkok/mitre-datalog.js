/**
 * @param options: '{ dataDir: './data' }'
 */
function wrapper(options){
"use strict";

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

var assert = function(thing) { if (thing !== true) throw new Error("Assertion failed");};

var example = function(clauses, queries) {
	assert(clauses !== undefined);
	this.clauses = clauses;
	this.queries = queries || "";
};

//for i in *.dl; do python -c "import json; print(\"'$(echo $i| cut -d. -f1)':\" + json.dumps(open('$i').read()));" >> out; done
var dataDir = options.dataDir;
var dataDirIndex = JSON.parse(get(dataDir + "/queries.json"));

var data = {};

$.map(dataDirIndex.databases, function(v,k) {
  if (v.clauses) {
    data[k] = new example(v.clauses);
  }
  else if (v.clauseFile && v.queryFile) {
    data[k] = new example(get(dataDir + "/" + v.clauseFile), get(dataDir + "/" + v.queryFile));
  }
});

//window.geteditor = function() { return editor; };

var contentChanged = false;
var loaded = false;

var switc = function(v) {
    if (contentChanged && loaded) if (!confirm("Changes will be overwritten. Really continue?")) return;
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
    loaded = true;
    contentChanged = false;
}

var onLoad = function() {
    // TODO FIXME XXX re-add autocomplete
    // CodeMirror.commands.autocomplete = function(cm) {
    //     CodeMirror.simpleHint(cm, CodeMirror.datalogHint);
    // }
    var lineNum = true, lineWrap = true;
    var editormap = function() { return {"datalog": editor, "lua":luaEditor, "query": queryEditor}; };
    editor = CodeMirror.fromTextArea(document.getElementById("datalog"), {
        mode: "datalog",
        lineNumbers: lineNum,
	lineWrapping: lineWrap,
        extraKeys: {"Ctrl-Space": "autocomplete"},
        onChange: function() {contentChanged=true; window["editorOnChange"](arguments[0], arguments[1], editormap());}
    });
    queryEditor = CodeMirror.fromTextArea(document.getElementById("queries"), {
        mode: "datalog",
        lineNumbers: lineNum,
	lineWrapping: lineWrap,
        extraKeys: {"Ctrl-Space": "autocomplete"},
        onChange: function() {contentChanged=true; window["editorOnChange"](arguments[0], arguments[1], editormap());}
    });
    luaEditor = CodeMirror.fromTextArea(document.getElementById("lua"), {
        mode: "lua",
        lineNumbers: lineNum,
	lineWrapping: lineWrap,
        onChange: function() {contentChanged=true; window["editorOnChange"](arguments[0], arguments[1], editormap());}
    });


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
      var val = "calc(" + jQuery(".body").height() + "px - 3.0em)";
      if (jQuery.browser.webkit) val = "-webkit-" + val;
      else if (jQuery.browser.mozilla) val = "-moz-" + val;
      else if (jQuery.browser.opera) val = "-o-" + val;
//      jQuery(".CodeMirror").css("height",val);
      jQuery(editor.getScrollerElement()).css("height", val);
      editor.refresh();
      jQuery(luaEditor.getScrollerElement()).css("height", val);
      luaEditor.refresh();
      jQuery(queryEditor.getScrollerElement()).css("height", val);
      queryEditor.refresh();
      jQuery(".outputtab").css("height", val);
    });

    luaEditor.setValue(get("default.lua"));
    input.onchange();

    var timer = null;

    Module["arguments"] = ['/lib.lua', '/datalog.dl', '/queries.dl'];
    Module["print"] = function(v) {
        distributeOutput(v);
        if (timer != null) {
          clearTimeout(timer);
          timer = null;
        }
    };
    write();

    jQuery.getScript("main.js", function(script, textStatus, jqXHR) {
      if (dataDirIndex.initialDatabase) {
        var db = data[dataDirIndex.initialDatabase];
        if (db) {
          if (db.clauses) {
            switc(dataDirIndex.initialDatabase);
          } else {
            jQuery('#output').html("Database '" + dataDirIndex.initialDatabase + "' does not contain any clauses.");
          }
        } else {
          jQuery("#output")
            .addClass("error")
            .html("Database '" + dataDirIndex.initialDatabase + "' doesn't exist.<br><br>Please select an existing one.");
        }
      } else {
          jQuery('#output').html('Please select a database.');
      }
      jQuery(window).resize();
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
    console.log(v);
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
    $("body").removeClass("twocolumnlayout");

    document.getElementById("output").innerHTML = "";
    tableOutput = new tableOutputHandler();
    // TODO FIXME XXX re-add error highlighting
    // var fileToBox = {'/lib\\.lua': luaEditor, '/datalog\\.dl': editor, '/queries\\.dl': queryEditor};
    // task.addListener("runFinished",function(rc){
    // $("#tableoutput table:last").tablesorter(); //.stupidtable();
    // jQuery("#output")[(rc === 0) ? "removeClass" : "addClass"]("error");
    // tab("t1","#outputtabcontainer");
    // if (rc !== 0) {
    //   // find error line and highlight
    //   Object.keys(fileToBox).map(function(v) {
    //     var re = new RegExp(v + ":(\\d+)");
    //     var arr = document.getElementById("output").innerHTML.match(re); // ["/datalog.dl:12", "12"]
    //     if (arr === null) return; //throw new Error("Could not find error line number");
    //     jump(Number(arr[1])-1,fileToBox[v]);
    //   });
    // }
    // });
    write();
    Module.ccall("schedule_run");
    return false;
};

window["tab"] = tab;

jQuery(document).ready(onLoad);
};

function datalogContent() {
    try {
      return editor.getValue();
    } catch (err) {
      return document.getElementById("datalog").value;
    }
}

function luaContent() {
    try {
      return luaEditor.getValue();
    } catch (err) {
      return document.getElementById("lua").value;
    }
}

function queryContent() {
    try {
      return queryEditor.getValue();
    } catch (err) {
      return document.getElementById("queries").value;
    }
}

var editor, luaEditor, queryEditor;

var write = function() {
    FS.writeFile('/datalog.dl', datalogContent());
    FS.writeFile('/queries.dl', queryContent());
    FS.writeFile('/lib.lua', luaContent());
};

var wrapperPreInit = function(FS) {
    window.FS = FS;
};
var Module = {};
