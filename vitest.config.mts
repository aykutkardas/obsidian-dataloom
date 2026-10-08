import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Date expectations use UTC; set before test workers start.
process.env.TZ = "UTC";

export default defineConfig({
	resolve: {
		alias: {
			src: fileURLToPath(new URL("./src", import.meta.url)),
			obsidian: fileURLToPath(new URL("./__mocks__/obsidian.ts", import.meta.url)),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		include: ["src/**/*.spec.{ts,tsx}"],
		clearMocks: false,
	},
});
