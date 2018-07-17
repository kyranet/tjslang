const { Parser } = require('../src/index');
const parsed = new Parser().parse(require('fs').readFileSync(require('path').join(__dirname, 'basic.tjs'), 'utf8'));
console.log(parsed.exports.LANGUAGE.PERMISSION.RESTRICTED_HELP.render()({ command: 'eval', role: '@everyone' }));
