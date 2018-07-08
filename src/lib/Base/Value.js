class BaseValue {

	constructor(ctx) {
		Object.defineProperty(this, 'context', { value: ctx });
	}

}

module.exports = BaseValue;
