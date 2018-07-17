const BaseValue = require('../Base/Value');
const ValueExpression = require('./Expression');

class ValueString extends BaseValue {

	constructor(ctx, string) {
		super(ctx);
		this.string = string.trim();
		this.parts = ValueString.parse(ctx, this.string);
	}

	get constant() {
		return this.parts.every(part => typeof part === 'string');
	}

	render(variables) {
		return this.parts.map(part => typeof part === 'string' ? part : part.render(variables)).join('');
	}

	display(args) {
		return this.parts.map(part => typeof part === 'string' ? part : part.display(args)).join('');
	}

	toJSON() {
		return this.parts;
	}

	toString() {
		return this.string;
	}

	static parse(ctx, string) {
		const parts = [];
		let lastIndex = 0, index, endingIndex = 0;
		while ((index = string.indexOf('{{', lastIndex)) !== -1) {
			endingIndex = string.indexOf('}}', index);
			if (endingIndex === -1) throw new TypeError();
			parts.push(string.slice(lastIndex, index), new ValueExpression(ctx, string.slice(index + 2, endingIndex)));
			lastIndex = endingIndex + 2;
		}

		return parts.length ? parts : [string];
	}

}

module.exports = ValueString;
