const { ValueFunction } = require('./ValueFunction');
const { ValueStaticString } = require('./ValueString');

class Parser {

	constructor() {
		this.variables = {};
		this.imports = {};
		this.exports = {};

		Object.defineProperties(this, {
			_line: { value: null, writable: true },
			_lines: { value: null, writable: true }
		});
	}

	parse(text) {
		this._line = 0;
		this._lines = text.split('\n');

		while (this._line < this._lines.length) {
			const line = this._lines[this._line];
			if (line.startsWith('import')) this._parseImportTag(line);
			else if (line.startsWith('export')) this._parseExportTag(line);
			else if (line.startsWith('define')) this._parseDefine(line);
			else if (!SPACES.test(line)) throw new Error();
			else this._line++;
		}

		return this;
	}

	toJSON() {
		return {
			variables: this.variables,
			imports: this.imports,
			exports: this.exports
		};
	}

	_parseDefine(firstLine) {
		if (firstLine[DEFINE_LENGTH] !== ' ') throw new Error();
		const name = firstLine.slice(EXPORT_LENGTH + 1);
		if (name in this.variables) throw new Error();

		let i = this._line;
		const lineLength = this._lines.length;
		let object;
		while (i < lineLength) {
			const line = this._lines[i];
			if (SPACES.test(line)) break;
			this._line++;
			object = this._parseObjectBlock(4);
			i = this._line;
		}

		this.variables[name] = object;
		this._line = i;
	}

	_parseObjectBlock(spaces) {
		const lineLength = this._lines.length;

		const object = {};
		while (this._line < lineLength) {
			const line = this._lines[this._line];
			const trim = line.trim();
			const spac = Parser._countPadding(line);
			if (spac === spaces) {
				if (/^\w+$/.test(trim)) {
					this._line++;
					object[trim] = this._parseObjectBlock(spaces + 4);
				} else {
					const [key, value] = this._parsePair(line);
					object[key] = value;
					this._line++;
				}
			} else if (spac > spaces) {
				throw new Error(JSON.stringify(object));
			} else {
				break;
			}
		}

		return object;
	}

	_parsePair(line) {
		const position = line.indexOf(':');
		if (position === -1) throw new Error();
		const name = line.slice(0, position).trim();
		const rest = line.slice(position + 1).trim();
		let value;

		if (VALUE_REFERENCE.test(rest)) {
			const result = VALUE_REFERENCE.exec(rest);
			if (!result.length) throw new TypeError();

			const [, variable] = result;
			const resolved = this.variables[variable] || this.imports[variable];
			if (typeof resolved === 'undefined') throw new ReferenceError();

			// TODO: Convert this to new ValueReference()
			value = resolved;
		} else if (VALUE_FUNCTION.test(rest)) {
			const parsed = FUNCTION_LITERAL.exec(rest);
			if (!parsed) throw new TypeError();
			const [, rawArgs, rawValue] = parsed;

			value = new ValueFunction(this, rawArgs.split(/, */), rawValue);
		} else {
			value = new ValueStaticString(this).parse(rest).toString();
		}

		return [name, value];
	}

	_parseExportTag(line) {
		if (line[EXPORT_LENGTH] !== ' ') throw new Error();
		const values = line.slice(EXPORT_LENGTH + 1).split(/, */);
		for (const value of values) {
			if (value in this.exports) throw new Error();
			const variable = this.variables[value] || this.imports[value];
			if (typeof variable === 'undefined') throw new Error();
			this.exports[value] = variable;
		}
		this._line++;
	}

	_parseImportTag(line) {
		if (line[IMPORT_LENGTH] !== ' ') throw new Error();
		const [moduleName, ...access] = line.slice(IMPORT_LENGTH + 1).split('.');
		let mod = require(moduleName);
		let pathAccess;
		if (access.length) {
			for (const path of access) {
				if (!(path in mod)) throw new Error();
				mod = mod[path];
			}
			pathAccess = access[access.length - 1];
		} else {
			pathAccess = moduleName;
		}

		if (pathAccess in this.imports) throw new Error();
		this.imports[pathAccess] = mod;
		this._line++;
	}

	static _countPadding(line) {
		if (SPACES.test(line)) return 0;
		switch (line.charCodeAt(0)) {
			case SPACE_CODE: return Parser._countSpaces(line);
			case TAB_CODE: return Parser._countTabs(line) * 4;
			default: return 0;
		}
	}

	static _countSpaces(line) {
		let i = 0;
		while (line.charCodeAt(i) === SPACE_CODE) i++;
		return i;
	}

	static _countTabs(line) {
		let i = 0;
		while (line.charCodeAt(i) === TAB_CODE) i++;
		return i;
	}

}

module.exports = Parser;

const IMPORT_LENGTH = 'import'.length;
const EXPORT_LENGTH = 'export'.length;
const DEFINE_LENGTH = 'define'.length;
const SPACES = /^\s*$/;
const SPACE_CODE = ' '.charCodeAt(0);
const TAB_CODE = '\t'.charCodeAt(0);

const VALUE_REFERENCE = /^\{\{([^}]*)\}\}$/;
const VALUE_FUNCTION = /^\([^)]*\)\s*=>/;

const FUNCTION_LITERAL = /^\(([^)]*)\)\s*=>\s*(.+)/;
