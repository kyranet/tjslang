const BaseValue = require('../Base/Value');

class ValueObject extends BaseValue {

	constructor(ctx) {
		super(ctx);

		this.entries = new Map();
	}

	set(key, value) {
		this.entries.set(key, value);
		return this;
	}

	get(key) {
		return this.entries.get(key);
	}

	render(variables) {
		return Object.assign({}, ...renderPairs(this, variables));
	}

	display(args) {
		return this.render(args);
	}

	toJSON() {
		return [...this.entries];
	}

}

function* renderPairs(vObject, variables) {
	for (const [key, value] of vObject.entries.entries()) yield { [key]: value.render(variables) };
}

module.exports = ValueObject;
