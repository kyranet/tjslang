const REGEXPESC = /[-/\\^$*+?.()|[\]{}]/g;

function regExpEsc(str) {
	return str.replace(REGEXPESC, '\\$&');
}

const VALUE_REFERENCE = /^\{\{([^}]*)\}\}$/;
const VALUE_FUNCTION = /^\([^)]*\)\s*=>/;
const CODE_QUOTE = '"'.charCodeAt(0);

function detectType(ctx, str) {
	if (VALUE_REFERENCE.test(str)) return new ValueExpression(ctx, str.slice(2, -2));
	if (VALUE_FUNCTION.test(str)) return new ValueFunction(ctx, str);
	if (str.charCodeAt(0) === CODE_QUOTE) {
		if (str.charCodeAt(str.length - 1) === CODE_QUOTE) return new ValueString(ctx, str.slice(1, -1));
		const output = [str];
		return {
			type: 'MULTILINE',
			push(line) {
				output.push(line);
				return line.charCodeAt(line.length - 1) === CODE_QUOTE;
			},
			finish() { return new ValueString(ctx, output.map(line => line.trim()).join('\n').slice(1, -1)); }
		};
	}
	return new ValueExpression(ctx, str);
}

module.exports = Object.freeze({ regExpEsc, detectType });

const ValueFunction = require('../Values/Function');
const ValueExpression = require('../Values/Expression');
const ValueString = require('../Values/String');
