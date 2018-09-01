const { read, write } = require('../src/index');
const PATH = require('path').join(__dirname, 'basic.tjs');

// Test write
write(PATH);
const parsed = read(PATH, { type: null });

// Test render
const rendered = parsed.render();
console.log('========================================================');
console.log('                        RENDERED                        ');
console.log('========================================================');
console.log(rendered);
console.log('========================================================');
console.log('\n');

// Test serialize
const serialized = parsed.serialize();
console.log('========================================================');
console.log('                       SERIALIZED                       ');
console.log('========================================================');
console.log(serialized);
console.log('========================================================');
console.log('\n');

// eslint-disable-next-line new-cap
console.log(rendered.LANGUAGE.PERMISSION.RESTRICTED_HELP({ command: 'eval', role: 'Core Developers' }));
