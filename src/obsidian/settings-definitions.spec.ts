import { getDataLoomSettingDefinitions } from "./settings-definitions";
import type { DataLoomSettings } from "src/obsidian/settings";
const DEFAULT_SETTINGS: DataLoomSettings = {
 logLevel: "off", createAtObsidianAttachmentFolder: false, customFolderForNewFiles: "",
 removeMarkdownOnExport: true, defaultEmbedWidth: "100%", defaultEmbedHeight: "340px",
 hasMigratedTo800: false, showWelcomeModal: false, defaultFrozenColumnCount: 1, pluginVersion: "8.16.19",
};

const getDefinitions = (overrides?: Partial<DataLoomSettings>) =>
	getDataLoomSettingDefinitions({ ...DEFAULT_SETTINGS, ...overrides });

describe("getDataLoomSettingDefinitions", () => {
	it("returns every settings group", () => {
		const defs = getDefinitions();
		const headings = defs
			.filter((d) => "heading" in d)
			.map((d) => ("heading" in d ? d.heading : undefined));
		expect(headings).toEqual([
			"File",
			"Table",
			"Export",
			"Embedded looms",
			"Debugging",
		]);
	});

	it("hides the custom folder setting when attachments folder is on", () => {
		const defs = getDefinitions({ createAtObsidianAttachmentFolder: true });
		const fileGroup = defs.find(
			(d) => "heading" in d && d.heading === "File"
		);
		const items =
			fileGroup && "items" in fileGroup ? fileGroup.items ?? [] : [];
		const customFolder = items.find(
			(i) => "name" in i && i.name === "Default location for new looms"
		);
		expect(customFolder).toBeTruthy();
		const visible =
			customFolder && "visible" in customFolder
				? typeof customFolder.visible === "function"
					? customFolder.visible()
					: customFolder.visible
				: true;
		expect(visible).toBe(false);
	});

	it("shows the custom folder setting when attachments folder is off", () => {
		const defs = getDefinitions({ createAtObsidianAttachmentFolder: false });
		const fileGroup = defs.find(
			(d) => "heading" in d && d.heading === "File"
		);
		const items =
			fileGroup && "items" in fileGroup ? fileGroup.items ?? [] : [];
		const customFolder = items.find(
			(i) => "name" in i && i.name === "Default location for new looms"
		);
		const visible =
			customFolder && "visible" in customFolder
				? typeof customFolder.visible === "function"
					? customFolder.visible()
					: customFolder.visible
				: true;
		expect(visible).toBe(true);
	});

	it("defines a control for every persisted settings key", () => {
		const defs = getDefinitions();
		const keys: string[] = [];
		for (const group of defs) {
			if ("items" in group && group.items) {
				for (const item of group.items) {
					if ("control" in item && item.control) keys.push(item.control.key);
				}
			}
		}
		expect(keys).toEqual([
			"createAtObsidianAttachmentFolder",
			"customFolderForNewFiles",
			"defaultFrozenColumnCount",
			"removeMarkdownOnExport",
			"defaultEmbedWidth",
			"defaultEmbedHeight",
			"logLevel",
		]);
	});
});
