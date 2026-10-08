import { App, Platform } from "obsidian";

export const isOnMobile = () => {
	return Platform.isMobile;
};

export const getResourcePath = (app: App, filePath: string) => {
	return app.vault.adapter.getResourcePath(filePath);
};
