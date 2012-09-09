var ccounter = 0;
var Module = {
//  'print': function(text) { alert(text) },
  'arguments': ['/test.dl'],
'preInit': function() {
var mystr = "% Equality test\n\
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
\n\n";
/*
  FS.init(function(){
var str = mystr;
	if (ccounter < str.length)
	return str.charAt(ccounter++);
	else
	return null;
}, undefined, undefined);
*/

FS.createDataFile('/', 'test.dl', mystr, true, false);

}
};
