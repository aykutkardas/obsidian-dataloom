import { DataAdapter } from "obsidian";

export const LEGACY_PLUGIN_IDS = [
	"obisidian-dataloom",
	"notion-like-tables",
] as const;

export interface LegacySettingsResult {
	pluginId: (typeof LEGACY_PLUGIN_IDS)[number];
	settings: Record<string, unknown>;
}

const getSettingsPath = (configDir: string, pluginId: string) =>
	`${configDir}/plugins/${pluginId}/data.json`.replace(/\/{2,}/g, "/");

export const hasSettingsData = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" &&
	value !== null &&
	!Array.isArray(value) &&
	Object.keys(value).length > 0;

/**
 * Finds settings from a legacy DataLoom installation without modifying or
 * deleting the legacy file. Invalid files are ignored so plugin startup can
 * continue with defaults.
 */
export const loadLegacyPluginSettings = async (
	adapter: Pick<DataAdapter, "exists" | "read">,
	configDir: string
): Promise<LegacySettingsResult | null> => {
	for (const pluginId of LEGACY_PLUGIN_IDS) {
		const path = getSettingsPath(configDir, pluginId);
		try {
			if (!(await adapter.exists(path))) continue;
			const parsed = JSON.parse(await adapter.read(path)) as unknown;
			if (!hasSettingsData(parsed)) continue;
			return { pluginId, settings: parsed };
		} catch {
			//Keep looking. A damaged legacy file must not prevent startup or
			//cause the original file to be overwritten.
		}
	}
	return null;
};
