module.exports = {
	env: {
		es2021: true,
		node: true,
		jest: true,
	},
	rules: {
		"no-await-in-loop": ["off"]
	},
	extends: ["eslint:recommended", "naver", "prettier"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
};
