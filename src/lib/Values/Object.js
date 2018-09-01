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

	serialize(context, name) {
		return Object.assign({}, ...serializePairs(this, context, name));
	}

	toJSON() {
		return [...this.entries];
	}

}

function* renderPairs(vObject, variables) {
	for (const [key, value] of vObject.entries.entries()) yield { [key]: value.render(variables) };
}

function* serializePairs(vObject, context, name) {
	for (const [key, value] of vObject.entries.entries()) yield { [key]: value.serialize(context, `${name}.${key}`) };
}

module.exports = ValueObject;
