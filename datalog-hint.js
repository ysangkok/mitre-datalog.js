(function () {

  CodeMirror.datalogHint = function(editor) {
    var cur = editor.getCursor();
    var token = editor.getTokenAt(editor.getCursor());
    var arr = editor.getValue().split("\n")
    .reduce(function(prev,curr,idx,a){ // zip lines with their numbers
      return prev.concat([[idx, curr]])
    },[]).filter(function(v) { // remove current line
      return v[0] != cur.line;
    }).map(function(w) { // remove line numbers
      return w[1];
    }).map(function(w) { // remove comments
      return w.replace(/%.*/,"");
    }).map(function(w) {
      return w.replace(/\([^\)]+\)/,"");
    }).join("\n").split(/[.\?~]/) // split on datalog literal splitters (TODO: only outside parens)
    .map(function(w) {
      return w.trim();
    }).filter(function(w) {
      return w !== "";
    }).map(function(w) { // get heads
      return w.split(":-")[0];
    }).map(function(w) {
      return w.trim();
    }).reduce(function(prev,curr,idx,a) {
      return (prev.indexOf(curr) === -1) ? [curr].concat(prev) : prev;
    },[]).filter(function(w) {
      return w.substr(0,token.string.length) === token.string;
    });
    //console.log(arr);
    return {
            list: arr,
            from: {line: cur.line, ch: token.start},
            to: {line: cur.line, ch: token.end}
           };
  };

})();
