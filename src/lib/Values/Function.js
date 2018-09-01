const BaseValue = require('../Base/Value');
const ValueString = require('./String');
const { SPACES } = require('../util/constants');

class ValueFunction extends BaseValue {

	constructor(ctx, string) {
		super(ctx);
		this.string = string.trim();
		this.variables = null;
		this.body = null;
		[this.variables, this.body] = ValueFunction.parse(ctx, this.string);
	}

	get constant() {
		return !this.variables.length || this.body.constant;
	}

	render(variables) {
		if (variables || this.constant) {
			const rendered = this.body.render(variables);
			return () => rendered;
		}
		const parseCtx = parseContext.bind(null, this);
		return (...r) => this.body.display(parseCtx(...r));
	}

	display(args) {
		if (args.length !== this.variables.length) throw new TypeError();
		if (this.constant) {
			const rendered = this.body.render(args);
			return () => rendered;
		}
		const parseCtx = parseContext.bind(null, this);
		return (...r) => this.body.display(parseCtx(...r));
	}

	serialize(context, name) {
		context.__headers__.push([name, this.variables]);
		return this.body.serialize(context, name);
	}

	toJSON() {
		return {
			variables: this.variables,
			body: this.body
		};
	}

	toString() {
		return this.string;
	}

	static parse(ctx, string) {
		const { end, value } = ValueFunction._parseFunctionArguments(string);
		const index = string.indexOf('=>', end);
		if (!SPACES.test(string.slice(end + 1, index))) throw new Error('Unexpected token');
		return [value, new ValueString(ctx, string.slice(index + 2))];
	}

	static _parseFunctionArguments(string) {
		if (string.charCodeAt(0) !== OPENING_PAREN_CODE) throw new Error('Expecting function to start with \'(\'.');
		const start = string.indexOf('(');
		if (start === -1) throw new Error('Expecting function to start with \'(\'.');
		const end = string.indexOf(')', start);
		if (end === -1) throw new Error('Expecting function to have a \')\' to close the function arguments.');
		const args = string.slice(start + 1, end).split(',').map(part => part.trim());

		// Handle duplicated arguments
		if (new Set(args).size !== args.length) throw new TypeError(`Unexpected duplicated args in the argument body ${args.join(', ')}`);
		return { start, end, value: args };
	}

}

function parseContext(vfn, ...args) {
	const object = {};
	for (let i = 0; i < vfn.variables.length; i++) object[vfn.variables[i]] = args[i];
	return object;
}

const OPENING_PAREN_CODE = '('.charCodeAt(0);

module.exports = ValueFunction;
