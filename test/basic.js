const { Parser } = require('../src/index');
const parsed = new Parser().parse(require('fs').readFileSync(require('path').join(__dirname, 'basic.tjs'), 'utf8'));
// console.log(parsed.exports.LANGUAGE.PERMISSION.RESTRICTED_HELP.render()({ command: 'eval', role: '@everyone' }));
// console.log(parsed.exports);
console.log(parsed.render());
// eslint-disable-next-line new-cap
console.log(parsed.render().LANGUAGE.PERMISSION.RESTRICTED_HELP({ command: 'eval', role: 'Core Developers' }));
