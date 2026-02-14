import tsparser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

const plugin = obsidianmd.default || obsidianmd;
// Extract rules from recommended config (it's an iterable that yields configs with extends)
// We'll use the rules object directly instead
const obsidianRules = {};
for (const [key, value] of Object.entries(plugin.configs?.recommended || {})) {
	if (!key.startsWith('Symbol.')) {
		obsidianRules[key] = value;
	}
}

export default [
	...tseslint.configs.recommended,
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsparser,
			parserOptions: { project: "./tsconfig.json" },
		},
		plugins: {
			obsidianmd: plugin,
		},
		rules: {
			...obsidianRules,
			// You can add your own configuration to override or add rules
		},
	},
];
