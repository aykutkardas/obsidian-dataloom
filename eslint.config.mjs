import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
				// Obsidian-injected globals for popout window support
				activeWindow: "readonly",
				activeDocument: "readonly",
			},
			parserOptions: {
				project: "./tsconfig.eslint.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},

	...obsidianmd.configs.recommended,

	// ✅ TEST FILES: expect/describe/it vb. globals
	{
		files: [
			"**/*.test.{js,cjs,mjs,ts,tsx}",
			"**/*.spec.{js,cjs,mjs,ts,tsx}",
			"test/**/*.{js,ts,tsx}",
			"tests/**/*.{js,ts,tsx}",
			"__tests__/**/*.{js,ts,tsx}",
		],
		languageOptions: {
			globals: {
				...globals.jest,
				...globals.vitest,
			},
		},
	},

	globalIgnores(["node_modules", "dist", "main.js"])
);
