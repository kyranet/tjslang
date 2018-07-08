// console.log(new ValueStaticString({ variables: {}, imports: {} })
// 	.parse(
// 		'⛔ **»»** This part of the {{obj.command}} command is only for {{obj.role}}',
// 		{ obj: { command: 'eval', role: 'myRole' } }
// 	)
// 	.toString()
// );
// console.log(new ValueDynamicString({ variables: {}, imports: {} })
// 	.parse('⛔ **»»** This part of the {{obj.command}} command is only for {{obj.role}}')
// 	.display({ obj: { command: 'eval', role: 'myRole' } })
// );
// function toUpperCase(string) {
// 	return string.toUpperCase();
// }
// function toLowerCase(string) {
// 	return string.toLowerCase();
// }
// console.log(new ValueDynamicString({ variables: {}, imports: { toUpperCase, toLowerCase } })
// 	.parse('⛔ **»»** This part of the {{toLowerCase(toUpperCase(obj.command))}} command is only for {{obj.role}}')
// 	.display({ obj: { command: 'eval', role: 'myRole' } })
// );
// console.log(new ValueDynamicString({ variables: {}, imports: { toUpperCase } })
// 	.parse('⛔ **»»** This part of the {{toUpperCase(obj.command)}} command is only for {{obj.role}}')
// 	.display({ obj: { command: 'eval', role: 'myRole' } })
// );

// console.log(JSON.stringify(new Parser().parse(`
// import os.constants.UV_UDP_REUSEADDR

// define TIMES
//     YEAR
//         1: year
//         DEFAULT: years
//     MONTH
//         1: month
//         DEFAULT: months

// define PERMISSIONS
//     ADMINISTRATOR: Administrator
//     VIEW_AUDIT_LOG: View Audit Log

// define LANGUAGE
//     PERMISSION
//         LIST: {{PERMISSIONS}}
//         RESTRICTED_HELP: (obj) => ⛔ **»»** This part of the {{obj.command}} command is only for {{obj.role}}
//         ADMIN_ONLY: you are not an admin of this server and cannot use this command!
//     REQUIREMENTS
//         NO_USER: You have to **mention a user** / give me an **user ID** to make this happen
//         NO_MEMBER: You have to **mention a server member** / give me a **member ID** to make this happen

// export TIMES, PERMISSIONS, LANGUAGE
// `), null, 4));

// console.log(new Expression({ variables: {}, imports: { log: console.log } }, 'log(1, 2)').display({}));
// console.log(new Expression({ variables: {}, imports: { stringify: (value) => String(value), type: (value) => typeof value } }, 'type(1 > 0 ? stringify(2) : null)').display({}));
// console.log(new Expression({ variables: {}, imports: { stringify: (value) => String(value), type: (value) => typeof value } }, 'type(1 < 0 ? stringify(2) : null)').display({}));
