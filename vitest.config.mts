import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Date expectations use UTC; set before test workers start.
process.env.TZ = "UTC";

export default defineConfig({
	plugins: [{
		name: "obsidian-test-mock",
		resolveId(id) {
			if (id === "obsidian") return "\0obsidian-test-mock";
		},
		load(id) {
			if (id === "\0obsidian-test-mock") {
				return "export const App = {}; export class TFile {}";
			}
		},
	}],
	resolve: {
		alias: {
			src: fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		include: ["src/**/*.spec.{ts,tsx}"],
		clearMocks: false,
	},
});
