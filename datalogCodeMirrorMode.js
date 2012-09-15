CodeMirror.defineMode("datalog", function(cmCfg, modeCfg) {

  function rval(state,stream,type) {
    state.context = false;

    // remember last significant bit on last line for indenting
    if (type != "whitespace" && type != "comment") {
      state.lastToken = stream.current();
    }
    //     erlang             :- CodeMirror tag
    switch (type) {
      case "atom":        return "atom";
      case "attribute":   return "attribute";
      case "builtin":     return "builtin"; // ~
      case "comment":     return "comment"; // %
//      case "fun":         return "meta";
      case "function":    return "tag"; // a in a(x).
//      case "guard":       return "property";
      case "keyword":     return "keyword"; // ?
//      case "macro":       return "variable-2";
      case "number":      return "number";
      case "operator":    return "operator"; // =
//      case "record":      return "bracket";
      case "string":      return "string";
 //     case "type":        return "def";
      case "variable":    return "variable";
      case "error":       return "error";
      case "separator":   return "variable-2"; // :-
      case "open_paren":  return null;
      case "close_paren": return null;
      case "whitespace":  return null;
      default:            console.error("unknown type " + type); return null;
    }
  }

  var separatorWords = [
    ":-",":",".",","];

  var symbolWords = [
    "="];

  var openParenWords = [
    "("];

  var smallRE      = /[a-z_]/;
  var largeRE      = /[A-Z_]/;
  var digitRE      = /[0-9]/;
  var anumRE       = /[a-z_A-Z0-9]/;
  var symbolRE     = /[=]/;
  var openParenRE  = /[\(]/;
  var sepRE        = /[\-\.,:]/;

  function isMember(element,list) {
    return (-1 < list.indexOf(element));
  }

  function isPrev(stream,string) {
    var start = stream.start;
    var len = string.length;
    if (len <= start) {
      var word = stream.string.slice(start-len,start);
      return word == string;
    }else{
      return false;
    }
  }

  function tokenize(stream, state) {
    if (stream.eatSpace()) {
      return rval(state,stream,"whitespace");
    }

    var ch = stream.next();

    // comment
    if (ch == '%') {
      stream.skipToEnd();
      return rval(state,stream,"comment");
    }

    // string
    if (ch == '"') {
      if (doubleQuote(stream)) {
        return rval(state,stream,"string");
      }else{
        return rval(state,stream,"error");
      }
    }

    // variable
    if (largeRE.test(ch)) {
      stream.eatWhile(anumRE);
      return rval(state,stream,"variable");
    }

    // atom/keyword/BIF/function
    if (smallRE.test(ch)) {
      stream.eatWhile(anumRE);

      var w = stream.current();

      if (stream.peek() == "(") {
          return rval(state,stream,"function");
      }
      return rval(state,stream,"atom");               
    }

    // number
    if (digitRE.test(ch)) {
      stream.eatWhile(digitRE);
      return rval(state,stream,"number");   // normal integer
    }

    // open parens
    if (nongreedy(stream,openParenRE,openParenWords)) {
      pushToken(state,stream);
      return rval(state,stream,"open_paren");
    }

    // close parens
    if (nongreedy(stream,/\)/,[")"])) {
      pushToken(state,stream);
      return rval(state,stream,"close_paren");
    }

    // separators
    if (greedy(stream,sepRE,separatorWords)) {
      // distinguish between "." as terminator and record field operator
      if (state.context == false) {
        pushToken(state,stream);
      }
      return rval(state,stream,"separator");
    }

    // operators
    if (greedy(stream,symbolRE,symbolWords)) {
      return rval(state,stream,"operator");
    }

    if (greedy(stream,/\?/,["?"])) {
      return rval(state,stream,"keyword");
    }

    if (greedy(stream,/\~/,["~"])) {
      return rval(state,stream,"builtin");
    }

    return rval(state,stream,null);
  }

  function nongreedy(stream,re,words) {
    if (stream.current().length == 1 && re.test(stream.current())) {
      stream.backUp(1);
      while (re.test(stream.peek())) {
        stream.next();
        if (isMember(stream.current(),words)) {
          return true;
        }
      }
      stream.backUp(stream.current().length-1);
    }
    return false;
  }

  function greedy(stream,re,words) {
    if (stream.current().length == 1 && re.test(stream.current())) {
      while (re.test(stream.peek())) {
        stream.next();
      }
      while (0 < stream.current().length) {
        if (isMember(stream.current(),words)) {
          return true;
        }else{
          stream.backUp(1);
        }
      }
      stream.next();
    }
    return false;
  }

  function doubleQuote(stream) {
    return quote(stream, '"', '\\');
  }

  function quote(stream,quoteChar,escapeChar) {
    while (!stream.eol()) {
      var ch = stream.next();
      if (ch == quoteChar) {
        return true;
      }else if (ch == escapeChar) {
        stream.next();
      }
    }
    return false;
  }

  function Token(stream) {
    this.token  = stream ? stream.current() : "";
    this.column = stream ? stream.column() : 0;
    this.indent = stream ? stream.indentation() : 0;
  }

  function myIndent(state,textAfter) {
    var indent = cmCfg.indentUnit;
    var token = (peekToken(state)).token;
    var wordAfter = takewhile(textAfter,/[^a-z]/);

    if (isMember(token,openParenWords)) {
      return (peekToken(state)).column+token.length;
    }else if (token == "." || token == ""){
      return 0;
    }else if (token == ":-") {
        return (peekToken(state)).indent+indent;
    }else{
      return (peekToken(state)).column+indent;
    }
  }

  function takewhile(str,re) {
    var m = str.match(re);
    return m ? str.slice(0,m.index) : str;
  }

  function popToken(state) {
    return state.tokenStack.pop();
  }

  function peekToken(state,depth) {
    var len = state.tokenStack.length;
    var dep = (depth ? depth : 1);
    if (len < dep) {
      return new Token;
    }else{
      return state.tokenStack[len-dep];
    }
  }

  function pushToken(state,stream) {
    var token = stream.current();
    var prev_token = peekToken(state).token;
    if (token === ",") {
      return false;
    }else if (drop_both(prev_token,token)) {
      popToken(state);
      return false;
    }else if (drop_first(prev_token,token)) {
      popToken(state);
      return pushToken(state,stream);
    }else{
      state.tokenStack.push(new Token(stream));
      return true;
    }
  }

  function drop_first(open, close) {
    switch (open+" "+close) {
      case ":- .":          return true;
      default:              return false;
    }
  }

  function drop_both(open, close) {
    switch (open+" "+close) {
      case "( )":         return true;
      default:            return false;
    }
  }

  return {
    startState:
      function() {
        return {tokenStack: [],
                context: false,
                lastToken: null};
      },

    token:
      function(stream, state) {
        return tokenize(stream, state);
      },

    indent:
      function(state, textAfter) {
//        console.log(state.tokenStack);
        return myIndent(state,textAfter);
      }
  };
});
