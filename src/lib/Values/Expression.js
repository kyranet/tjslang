const BaseValue = require('../Base/Value');
const { VALUE_TERNARY, VALUE_NUMERIC, VALUE_FUNCTION, BINARY_OPERATORS, BINARY_EXPRESSION_OPERATOR, UNARY_EXPRESSION_OPERATOR } = require('../util/constants');

class Expression extends BaseValue {

	constructor(ctx, expression) {
		super(ctx);
		this.string = expression.trim();
		this.expression = Expression.parse(ctx, this.string);
	}

	get constant() {
		const { type, value } = this.expression;
		return typeof value !== 'function' && ((type === 'constant')
			|| (type === 'raw')
			|| (type === 'inherit' && value.constant));
	}

	render(variables) {
		if (this.constant) return this.expression.value;
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

	/* eslint-disable complexity */
	static parse(ctx, expression) {
		switch (expression) {
			case 'true': return { type: 'constant', value: true };
			case 'false': return { type: 'constant', value: false };
			case 'null': return { type: 'constant', value: null };
		}

		if (VALUE_NUMERIC.test(expression))
			return { type: 'constant', value: Number(expression) };

		if (VALUE_FUNCTION.test(expression)) {
			const [, _name, _args] = VALUE_FUNCTION.exec(expression);
			const name = _name.trim();
			const fn = ctx.imports[name] || ctx.variables[name] || global[name];
			if (typeof fn !== 'function') throw new TypeError();
			const expressions = _args.split(/, */).map(arg => new Expression(ctx, arg));
			const parsedArgs = expressions.map(expr => expr.display());
			if (expressions.every(expr => expr.constant)) return { type: 'constant', value: fn(...parsedArgs) };

			return { type: 'function', value: (args) => fn.apply(fn, parsedArgs.map(arg => typeof arg === 'function' ? arg(args) : arg)) };
		}

		if (expression in global) return { type: 'constant', value: global[expression] };
		if (VALUE_TERNARY.test(expression)) {
			const [, _condition, _ifTrue, _ifFalse] = VALUE_TERNARY.exec(expression);
			const condition = new Expression(ctx, _condition);
			if (condition.constant) {
				const inheritExpression = new Expression(ctx, condition.render() ? _ifTrue : _ifFalse);
				return inheritExpression.constant ? { type: 'constant', value: inheritExpression.render() } : { type: 'inherit', value: inheritExpression.render() };
			}

			const ifTrue = new Expression(ctx, _ifTrue).render();
			const ifFalse = new Expression(ctx, _ifFalse).render();
			return { type: 'ternary', value: (args) => condition.display(args) ? ifTrue(args) : ifFalse(args) };
		}
		if (BINARY_EXPRESSION_OPERATOR.test(expression)) {
			const [, _first, operator, _second] = BINARY_EXPRESSION_OPERATOR.exec(expression);
			const leftHandExpression = new Expression(ctx, _first);
			const rightHandExpression = new Expression(ctx, _second);
			if (!(operator in EXPRESSIONS)) throw new Error(`The operator '${operator}' does not exist.`);
			const handler = EXPRESSIONS[operator];
			const parsed = Expression._parseBinaryExpression(leftHandExpression, rightHandExpression, handler);
			if (parsed.type === 'constant') return parsed;
			return { type: 'binary-expression', value: parsed.value };
		}
		if (UNARY_EXPRESSION_OPERATOR.test(expression)) {
			const [, operator, _expression] = UNARY_EXPRESSION_OPERATOR.exec(expression);
			const valueExpression = new Expression(ctx, _expression);
			if (!(operator in EXPRESSIONS)) throw new Error(`The operator '${operator}' does not exist.`);
			const handler = EXPRESSIONS[operator];
			return valueExpression.constant
				? { type: 'constant', value: handler(valueExpression.render()) }
				: { type: 'unary-expression', value: (args) => handler(valueExpression.display(args)) };
		}

		if (expression.includes('.')) return { type: 'variable', value: Expression.variableAccess.bind(ctx, expression) };

		return { type: 'raw', value: expression };
	}
	/* eslint-enable complexity */

	static _parseBinaryExpression(leftExpression, rightExpression, handler) {
		const isLeftConstant = leftExpression.constant, isRightConstant = rightExpression.constant;

		// Both expressions are constant
		if (isLeftConstant && isRightConstant) return { type: 'constant', value: handler(leftExpression.render(), rightExpression.render()) };

		// Left expression is constant
		if (isLeftConstant && !isRightConstant) {
			const leftConstant = leftExpression.render();
			return { type: 'function', value: (args) => handler(leftConstant, rightExpression.display(args)) };
		}

		// Right expression is constant
		if (!isLeftConstant && isRightConstant) {
			const rightConstant = rightExpression.render();
			return { type: 'function', value: (args) => handler(leftExpression.display(args), rightConstant) };
		}

		// None of both exxpressions are constant
		return { type: 'function', value: (args) => handler(leftExpression.display(args), rightExpression.display(args)) };
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

/* eslint-disable no-bitwise, eqeqeq */
const EXPRESSIONS = Object.freeze({
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
	'!': (expression) => !expression,
	...Object.assign({}, ...BINARY_OPERATORS.map(operator => ({ [`${operator}=`](...args) { return this[operator](...args); } })))
});
/* eslint-enable no-bitwise, eqeqeq */

module.exports = Expression;
