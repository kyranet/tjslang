class ValueString {

	constructor(ctx) {
		this.context = ctx;
		this.parts = [];
	}

	parseVariable(raw, extraVariables = {}, richOutput) {
		const functionResult = FUNCTION_REGEX.exec(raw);
		if (functionResult) {
			const [, name, contents] = functionResult;
			const fn = this.context.imports[name] || this.context.variables[name] || extraVariables[name] || global[name];
			if (typeof fn !== 'function') throw new TypeError();
			const inner = this.parseVariable(contents.trim(), extraVariables, richOutput);
			return richOutput ? { type: 'function', contents: (args) => fn(inner.contents(args)), toString() { return fn(contents); } } : fn(inner);
		}

		const access = variableAccess.bind(null, this.context, raw, raw.split('.'));
		return richOutput ? { type: 'variable', contents: access, raw } : access(extraVariables);
	}

	toString() {
		return this.parts.join('');
	}

}

function variableAccess(ctx, raw, parts, variables) {
	const name = parts.shift();
	let variable = ctx.imports[name] || ctx.variables[name] || variables[name] || global[name];
	if (raw !== 'undefined' && typeof variable === 'undefined') throw new ReferenceError();
	for (const part of parts) {
		if (!(part in variable)) throw new Error();
		variable = variable[part];
	}

	return variable;
}

class ValueStaticString extends ValueString {

	parse(string, variables = {}) {
		const parts = parseString(string);
		for (const part of parts) {
			if (typeof part === 'string')
				this.parts.push(part);
			else
				this.parts.push(this.parseVariable(part.raw, variables, false));
		}

		return this;
	}

}

class ValueDynamicString extends ValueString {

	parse(string, variables = {}) {
		const parts = parseString(string);
		for (const part of parts) {
			if (typeof part === 'string')
				this.parts.push(part);
			else
				this.parts.push(this.parseVariable(part.raw, variables, true));
		}

		return this;
	}

	display(args) {
		const output = [];
		for (const part of this.parts) {
			console.log(part);
			if (typeof part === 'string') output.push(part);
			else output.push(part.contents(args));
		}

		return output.join('');
	}

}

const FUNCTION_REGEX = /^([_a-zA-Z][_a-zA-Z0-9]+) *\((.+)\)$/;

function parseString(string) {
	const parts = [];
	let lastIndex = 0, index, endingIndex = 0;
	while ((index = string.indexOf('{{', lastIndex)) !== -1) {
		endingIndex = string.indexOf('}}', index);
		if (endingIndex === -1) throw new TypeError();
		parts.push(string.slice(lastIndex, index), {
			raw: string.slice(index + 2, endingIndex),
			value: null
		});
		lastIndex = endingIndex + 2;
	}

	return parts;
}

console.log(parseString('⛔ **»»** This part of the {{obj.command}} command is only for {{obj.role}}'));
console.log(new ValueStaticString({ variables: {}, imports: {} })
	.parse(
		'⛔ **»»** This part of the {{obj.command}} command is only for {{obj.role}}',
		{ obj: { command: 'eval', role: 'myRole' } }
	)
	.toString()
);
console.log(new ValueDynamicString({ variables: {}, imports: {} })
	.parse('⛔ **»»** This part of the {{obj.command}} command is only for {{obj.role}}')
	.display({ obj: { command: 'eval', role: 'myRole' } })
);
function toUpperCase(string) {
	return string.toUpperCase();
}
function toLowerCase(string) {
	return string.toLowerCase();
}
console.log(new ValueDynamicString({ variables: {}, imports: { toUpperCase, toLowerCase } })
	.parse('⛔ **»»** This part of the {{toLowerCase(toUpperCase(obj.command))}} command is only for {{obj.role}}')
	.display({ obj: { command: 'eval', role: 'myRole' } })
);

// module.exports = ValueString;
