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
