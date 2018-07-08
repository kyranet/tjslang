const REGEXPESC = /[-/\\^$*+?.()|[\]{}]/g;

function regExpEsc(str) {
	return str.replace(REGEXPESC, '\\$&');
}

module.exports = Object.freeze({ regExpEsc });
