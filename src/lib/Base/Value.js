class BaseValue {

	constructor(ctx) {
		Object.defineProperty(this, 'context', { value: ctx });
	}

	serialize() {
		return this.toString();
	}

	toString() {
		return `${this.constructor.name}`;
	}

}

module.exports = BaseValue;
