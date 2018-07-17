const { regExpEsc } = require('./util');

exports.VALUE_FUNCTION = /^([_a-zA-Z][_a-zA-Z0-9]+) *\((.+)\)$/;
exports.VALUE_TERNARY = /^(.+)\s*\?\s*(.+)\s*:\s*(.+)$/;
exports.VALUE_NUMERIC = /^\d+$/;

exports.BINARY_OPERATORS = ['+', '-', '*', '/', '%', '**', '<<', '>>', '>>>', '&', '^', '|'];
exports.BINARY_EXPRESSION_OPERATOR = (array => new RegExp(`(\\d+|[a-zA-Z_][a-zA-Z_0-9.]+)\\s*(${array.concat(
	['==', '===', '!=', '!==', '>', '<', '>=', '<=', '&&', '||', ' in '].map(regExpEsc), array.map(item => `${item}=`)
).join('|')})\\s*(\\d+|[a-zA-Z_][a-zA-Z_0-9.]+)`))(exports.BINARY_OPERATORS.map(regExpEsc));
exports.UNARY_OPERATORS = ['~', '!'];
exports.UNARY_EXPRESSION_OPERATOR = (array => new RegExp(`(${array.join('|')})\\s*(\\d+|[a-zA-Z_][a-zA-Z_0-9.]+)`))(exports.UNARY_OPERATORS.map(regExpEsc));

exports.SPACE = /\s/;
exports.SPACES = /\s*/;
