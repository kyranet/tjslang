const BaseValue = require('../Base/Value');
const { VALUE_TERNARY, VALUE_NUMERIC, BINARY_OPERATORS, BINARY_EXPRESSION_OPERATOR, UNARY_EXPRESSION_OPERATOR } = require('../util/constants');

class Expression extends BaseValue {

	constructor(ctx, expression) {
		super(ctx);
		this.string = expression.trim();
		this.expression = Expression.parse(ctx, this.string);
	}

	render(variables) {
		// During render, when a variable is given, it implies static value. Therefore, we will
		// parse it.
		return typeof this.expression.value === 'function'
			? variables
				? this.expression.value(variables)
				: this.expression.value.bind(this.expression)
			: this.expression.value;
	}

	display(args) {
		return typeof this.expression.value === 'function' ? this.expression.value(args) : this.expression.value;
	}

	toJSON() {
		return this.expression;
	}

	toString() {
		return `{{${this.string}}}`;
	}

	static parse(ctx, expression) {
		switch (expression) {
			case 'true': return { type: 'primitive', value: true };
			case 'false': return { type: 'primitive', value: false };
			case 'null': return { type: 'primitive', value: null };
		}

		if (VALUE_NUMERIC.test(expression))
			return { type: 'number', value: Number(expression) };

		if (expression in global) return { type: 'global', value: global[expression] };
		if (VALUE_TERNARY.test(expression)) {
			const [, _condition, _ifTrue, _ifFalse] = VALUE_TERNARY.exec(expression);
			const condition = new Expression(ctx, _condition);
			const ifTrue = new Expression(ctx, _ifTrue);
			const ifFalse = new Expression(ctx, _ifFalse);
			return { type: 'ternary', value: (args) => condition.display(args) ? ifTrue.display(args) : ifFalse.display(args) };
		}
		if (BINARY_EXPRESSION_OPERATOR.test(expression)) {
			const [, _first, operator, _second] = BINARY_EXPRESSION_OPERATOR.exec(expression);
			const leftHandExpression = new Expression(ctx, _first);
			const rightHandExpression = new Expression(ctx, _second);
			if (!(operator in EXPRESSIONS)) throw new Error(`The operator '${operator}' does not exist.`);
			const handler = EXPRESSIONS[operator];
			return { type: 'binary-expression', value: (args) => handler(leftHandExpression.display(args), rightHandExpression.display(args)) };
		}
		if (UNARY_EXPRESSION_OPERATOR.test(expression)) {
			const [, operator, _expression] = UNARY_EXPRESSION_OPERATOR.exec(expression);
			const valueExpression = new Expression(ctx, _expression);
			const handler = EXPRESSIONS[operator];
			if (!handler) throw new Error();
			return { type: 'unary-expression', value: (args) => handler(valueExpression.display(args)) };
		}

		if (expression.includes('.')) return { type: 'variable', value: Expression.variableAccess.bind(ctx, expression) };

		return { type: 'raw', value: expression };
	}

	static variableAccess(ctx, raw, variables) {
		if (!variables) throw new TypeError('');
		const parts = raw.split('.');
		const name = parts.shift();
		let variable = ctx.imports[name] || ctx.variables[name] || variables[name] || global[name];
		if (raw !== 'undefined' && typeof variable === 'undefined') throw new ReferenceError();
		for (const part of parts) {
			if (!(part in variable)) throw new Error();
			variable = variable[part];
		}

		return variable;
	}

}

/* eslint-disable no-bitwise, eqeqeq, quote-props */
const EXPRESSIONS = {
	'+': (left, right) => left + right,
	'-': (left, right) => left - right,
	'*': (left, right) => left * right,
	'/': (left, right) => left / right,
	'%': (left, right) => left % right,
	'**': (left, right) => left ** right,
	'<<': (left, right) => left << right,
	'>>': (left, right) => left >> right,
	'>>>': (left, right) => left >>> right,
	'&': (left, right) => left & right,
	'^': (left, right) => left ^ right,
	'|': (left, right) => left | right,
	'!=': (left, right) => left != right,
	'!==': (left, right) => left !== right,
	'==': (left, right) => left == right,
	'===': (left, right) => left === right,
	'>': (left, right) => left > right,
	'<': (left, right) => left < right,
	'>=': (left, right) => left >= right,
	'<=': (left, right) => left <= right,
	'&&': (left, right) => left && right,
	'||': (left, right) => left || right,
	' in ': (left, right) => left in right,
	'~': (expression) => ~expression,
	'!': (expression) => !expression
};
/* eslint-enable no-bitwise, eqeqeq, quote-props */
for (const operator of BINARY_OPERATORS)
	EXPRESSIONS[`${operator}=`] = BINARY_OPERATORS[operator];

Expression.EXPRESSIONS = Object.freeze(EXPRESSIONS);

module.exports = Expression;
