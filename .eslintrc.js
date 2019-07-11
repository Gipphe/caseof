module.exports = {
	root: true,
	extends: ['./node_modules/sanctuary-style/eslint-es3.json'],
	rules: {
		strict: 'off',
		indent: [
			'error',
			'tab',
			{
				'SwitchCase': 1,
				'FunctionDeclaration': { 'parameters': 'first' },
				'FunctionExpression': { 'parameters': 'first' },
				'CallExpression': { 'arguments': 'first' },
				'ArrayExpression': 'first',
				'ObjectExpression': 'first',
				'ignoredNodes': [
					'CallExpression',
					'CallExpression > *',
					'CallExpression > ArrowFunctionExpression ArrowFunctionExpression > *',
					'CallExpression > FunctionExpression > BlockStatement',
					'ConditionalExpression',
					'MemberExpression'
				],
			},
		],
		'no-tabs': 'off',
	},
	overrides: [
		{
			files: ['*.md'],
			globals: {
				'$': false,
				'Cons': false,
				'Descending': false,
				'Just': false,
				'Left': false,
				'Nil': false,
				'Nothing': false,
				'Pair': false,
				'R': false,
				'Right': false,
				'S': false,
				'Sum': false,
				'localStorage': false,
				'sanctuary': false,
				'window': false
			},
			rules: {
				'comma-dangle': ['error', 'always-multiline'],
				'indent': ['off'],
				'no-eval': ['off'],
				'no-extra-semi': ['off'],
				'no-unused-vars': ['error', { 'varsIgnorePattern': '^([$]|S)$' }]
			}
		}
	]
}
