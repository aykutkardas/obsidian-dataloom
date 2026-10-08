import type { SettingDefinitionItem } from "obsidian";
import {
	LOG_LEVEL_DEBUG,
	LOG_LEVEL_ERROR,
	LOG_LEVEL_INFO,
	LOG_LEVEL_OFF,
	LOG_LEVEL_TRACE,
	LOG_LEVEL_WARN,
} from "src/shared/logger/constants";
import type { DataLoomSettings } from "../main";

/**
 * Declarative settings (Obsidian 1.13.0+).
 *
 * Kept as a pure function (no PluginSettingTab runtime) so it is unit
 * testable and cheap to call on every tab update. Each `key` maps to a
 * property on `plugin.settings`; the tab persists changes via saveSettings().
 *
 * The imperative `display()` in dataloom-settings-tab.ts must stay in sync
 * for users on Obsidian < 1.13.0.
 */
export const getDataLoomSettingDefinitions = (
	settings: DataLoomSettings
): SettingDefinitionItem[] => {
	const embedEffectDesc =
		"Accepts valid HTML size values like 100px or 50%. Close and reopen your embedded looms for this to take effect.";
	return [
		{
			type: "group",
			heading: "File",
			items: [
				{
					name: "Create looms in the attachments folder",
					desc: "Create looms in the attachments folder defined in the Obsidian settings. This can be changed in Files & Links -> Default location for new attachments. Otherwise, the folder location below will be used.",
					control: {
						type: "toggle",
						key: "createAtObsidianAttachmentFolder",
					},
				},
				{
					name: "Default location for new looms",
					desc: "Where newly created looms are placed. Default location is the vault root folder, if not specified.",
					visible: () =>
						settings.createAtObsidianAttachmentFolder === false,
					control: {
						type: "text",
						key: "customFolderForNewFiles",
					},
				},
			],
		},
		{
			type: "group",
			heading: "Table",
			items: [
				{
					name: "Frozen columns",
					desc: "The number of columns to stay in place when the table scrolls horizontally.",
					control: {
						type: "number",
						key: "defaultFrozenColumnCount",
						min: 0,
						max: 3,
						step: 1,
					},
				},
			],
		},
		{
			type: "group",
			heading: "Export",
			items: [
				{
					name: "Remove Markdown",
					desc: "If enabled, content will be exported as plain text instead of markdown. For example, if enabled, a checkbox cell's content will be exported true or false instead of [ ] or [x].",
					control: {
						type: "toggle",
						key: "removeMarkdownOnExport",
					},
				},
			],
		},
		{
			type: "group",
			heading: "Embedded looms",
			items: [
				{
					name: "Default embedded loom width",
					desc: `The default embedded loom width. ${embedEffectDesc}`,
					control: {
						type: "text",
						key: "defaultEmbedWidth",
					},
				},
				{
					name: "Default embedded loom height",
					desc: `The default embedded loom height. ${embedEffectDesc}`,
					control: {
						type: "text",
						key: "defaultEmbedHeight",
					},
				},
			],
		},
		{
			type: "group",
			heading: "Debugging",
			items: [
				{
					name: "Log level",
					desc: "Sets the log level. Please use trace to see all log messages.",
					control: {
						type: "dropdown",
						key: "logLevel",
						options: {
							[LOG_LEVEL_OFF]: "Off",
							[LOG_LEVEL_ERROR]: "Error",
							[LOG_LEVEL_WARN]: "Warn",
							[LOG_LEVEL_INFO]: "Info",
							[LOG_LEVEL_DEBUG]: "Debug",
							[LOG_LEVEL_TRACE]: "Trace",
						},
					},
				},
			],
		},
	];
};
