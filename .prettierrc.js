/** @type {import('prettier').Config} */
module.exports = {
	singleQuote: false,
	semi: true,
	trailingComma: "all",
	printWidth: 100, //Use View: Toggle Word Wrap (Alt + Z) if 110 is more than your preferences
	plugins: [require.resolve("prettier-plugin-organize-imports")],
};
