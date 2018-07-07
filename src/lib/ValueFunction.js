const { ValueDynamicString } = require('./ValueString');

class ValueFunction {

	constructor(ctx, args, string) {
		this.context = ctx;
		Object.defineProperties(this, {
			valueString: { value: new ValueDynamicString(ctx).parse(string) },
			args: { value: args.map(arg => arg.trim()) }
		});
	}

	display(...args) {
		if (args.length !== this.args.length) throw new TypeError();
		const object = {};
		for (let i = 0; i < this.args.length; i++) object[this.args[i]] = args[i];
		return this.valueString.display(args);
	}

}

module.exports = Object.freeze({ ValueFunction });
