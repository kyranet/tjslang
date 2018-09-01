const Parser = require('./Parser');
const { readFileSync, readFile, writeFileSync } = require('fs');
const readFileAsync = require('util').promisify(readFile);

function parse(data, { type = 'js' } = {}) {
	const parsed = new Parser().parse(data);
	if (type === 'json') return parsed.serialize();
	if (type === 'js' || type === 'javascript') return parsed.render();

	return parsed;
}

function _write(path, data) {
	const { entries, ...headers } = parse(data, { type: 'json' });
	if (path.endsWith('.json')) path = path.slice(0, -5);
	writeFileSync(`${path}.json`, JSON.stringify(entries), 'utf8');
	writeFileSync(`${path}.headers.json`, JSON.stringify(headers), 'utf8');
}

function write(path, { sync = true, outputPath = 'output' } = {}) {
	return sync ? _write(outputPath, readFileSync(path, 'utf8')) : readFileAsync(path, 'utf8').then(data => _write(outputPath, data));
}

function writeAsync(path, options = {}) {
	return write(path, { ...options, sync: false });
}

function read(path, { sync = true, ...options } = {}) {
	return sync ? parse(readFileSync(path, 'utf8'), options) : readFileAsync(path, 'utf8').then(data => parse(data, options));
}

function readAsync(path, options = {}) {
	return read(path, { ...options, sync: false });
}

module.exports = { parse, read, readAsync, write, writeAsync };
