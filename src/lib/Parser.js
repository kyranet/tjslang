class Parser {

	constructor() {
		this.variables = {};
		this.imports = {};
		this.exports = {};

		this._line = null;
		this._lines = null;
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
	}

	_parseDefine(firstLine) {
		if (firstLine[DEFINE_LENGTH] !== ' ') throw new Error();
		const name = firstLine.slice(EXPORT_LENGTH + 1);
		if (name in this.variables) throw new Error();

		let i = this._line;
		const object = {}, lineLength = this._lines.length;
		while (i < lineLength) {
			const line = this._lines[i++];
			if (SPACES.test(line)) break;
		}

		this.variables[name] = object;
		this._line = i;
	}

	_parseObjectBlock(i, spaces) {
		const lineLength = this._lines.length;
		const object = {};
		let nextCount, line, nextLine = this._lines[i];

		while (i < lineLength) {
			line = nextLine;
			nextLine = this._lines[i + 1];
			i += 2;

			nextCount = Parser._countPadding(nextLine);

			if (nextCount === spaces) {
				const [key, value] = this._parsePair(line);
				object[key] = value;
			} else if (nextCount > spaces) {
				object[line.trim()] = this._parseObjectBlock(i, nextCount);
				i = this._line;
			} else {
				const [key, value] = this._parsePair(line);
				object[key] = value;
				break;
			}
		}

		this._line = i;
		return object;
	}

	_parsePair(line) {
		const position = line.indexOf(':');
		if (position === -1) throw new Error();
		const name = line.slice(0, position).trim();
		const rest = line.slice(position + 1).trim();
		let value;

		if (VALUE_REFERENCE.test(rest)) {
			const variable = VALUE_REFERENCE.exec(rest);
			if (!variable.length) throw new TypeError();

			const resolved = this.variables[variable] || this.imports[variable];
			if (typeof resolved === 'undefined') throw new ReferenceError();

			// TODO: Convert this to new ValueReference()
			value = resolved;
		} else if (VALUE_FUNCTION.test(rest)) {
			const parsed = FUNCTION_LITERAL.exec(rest);
			if (!parsed) throw new TypeError();
			const [, rawArgs, rawValue] = parsed;

			// TODO: Convert this to new ValueFunction()
			value = {
				arguments: rawArgs.split(/, */).map(string => string.trim()),
				// TODO: Convert this to new ValueString() in ValueFunction()
				string: rawValue
			};
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

const VALUE_REFERENCE = /^\{\{[^}]*\}\}$/;
const VALUE_FUNCTION = /^\([^)]*\)\s*=>/;

const FUNCTION_LITERAL = /^\(([^)]*)\)\s*=>\s*(.+)/;
