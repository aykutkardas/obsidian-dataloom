import {
	hasSettingsData,
	loadLegacyPluginSettings,
} from "./plugin-settings-migration";

const createAdapter = (files: Record<string, string>) => ({
	exists: jest.fn(async (path: string) => path in files),
	read: jest.fn(async (path: string) => files[path]),
});

describe("plugin settings migration", () => {
	const configDir = "custom-config";

	it("recognizes only non-empty settings objects", () => {
		expect(hasSettingsData({ logLevel: "WARN" })).toBe(true);
		expect(hasSettingsData({})).toBe(false);
		expect(hasSettingsData(null)).toBe(false);
		expect(hasSettingsData([])).toBe(false);
	});

	it("prefers settings from the misspelled fork id", async () => {
		const adapter = createAdapter({
			"custom-config/plugins/obisidian-dataloom/data.json": JSON.stringify({
				logLevel: "DEBUG",
			}),
			"custom-config/plugins/notion-like-tables/data.json": JSON.stringify({
				logLevel: "WARN",
			}),
		});

		await expect(
			loadLegacyPluginSettings(adapter, configDir)
		).resolves.toEqual({
			pluginId: "obisidian-dataloom",
			settings: { logLevel: "DEBUG" },
		});
	});

	it("falls back to the original plugin id", async () => {
		const adapter = createAdapter({
			"custom-config/plugins/notion-like-tables/data.json": JSON.stringify({
				showWelcomeModal: false,
			}),
		});

		await expect(
			loadLegacyPluginSettings(adapter, configDir)
		).resolves.toEqual({
			pluginId: "notion-like-tables",
			settings: { showWelcomeModal: false },
		});
	});

	it("ignores malformed legacy settings", async () => {
		const adapter = createAdapter({
			"custom-config/plugins/obisidian-dataloom/data.json": "not json",
		});

		await expect(
			loadLegacyPluginSettings(adapter, configDir)
		).resolves.toBeNull();
	});
});
