import { LOG_LEVEL_OFF } from "src/shared/logger/constants";

export interface DataLoomSettings {
	logLevel: string;
	createAtObsidianAttachmentFolder: boolean;
	customFolderForNewFiles: string;
	removeMarkdownOnExport: boolean;
	defaultEmbedWidth: string;
	defaultEmbedHeight: string;
	hasMigratedTo800: boolean;
	showWelcomeModal: boolean;
	defaultFrozenColumnCount: number;
	pluginVersion: string;
}

export const DEFAULT_SETTINGS: DataLoomSettings = {
	logLevel: LOG_LEVEL_OFF,
	createAtObsidianAttachmentFolder: false,
	customFolderForNewFiles: "",
	removeMarkdownOnExport: true,
	defaultEmbedWidth: "100%",
	defaultEmbedHeight: "340px",
	hasMigratedTo800: false,
	showWelcomeModal: true,
	defaultFrozenColumnCount: 1,
	pluginVersion: "",
};
