const { Parser } = require('../src/index');
const parsed = new Parser().parse(require('fs').readFileSync(require('path').join(__dirname, 'basic.tjs'), 'utf8'));

const rendered = parsed.render();
console.log(rendered);

// eslint-disable-next-line new-cap
console.log(rendered.LANGUAGE.PERMISSION.RESTRICTED_HELP({ command: 'eval', role: 'Core Developers' }));
