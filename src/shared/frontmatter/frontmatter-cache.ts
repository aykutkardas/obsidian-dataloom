import { App } from "obsidian";
import { ObsidianPropertyType } from "./types";
import {
	getAllObsidianProperties,
	toObsidianPropertyType,
} from "./obsidian-utils";

export default class FrontmatterCache {
	static instance: FrontmatterCache;

	private cache: Map<string, ObsidianPropertyType> = new Map<
		string,
		ObsidianPropertyType
	>();

	loadProperties(app: App) {
		this.cache.clear();

		const properties = getAllObsidianProperties(app);
		Object.values(properties).forEach((value) => {
			//Obsidian 1.9+ exposes the property type as `widget`,
			//older versions expose it as `type`
			const { name, type, widget } = value;
			this.cache.set(
				name,
				toObsidianPropertyType(widget ?? type) ??
					ObsidianPropertyType.TEXT
			);
		});
	}

	getPropertyNames(type: ObsidianPropertyType) {
		const keys = [];
		for (const [key, value] of this.cache.entries()) {
			if (value === type) {
				keys.push(key);
			}
		}
		return keys;
	}

	getPropertyType(name: string) {
		return this.cache.get(name);
	}

	setPropertyType(name: string, type: ObsidianPropertyType | null) {
		if (type === null) {
			this.cache.delete(name);
			return;
		}
		this.cache.set(name, type);
	}

	getCache() {
		return this.cache;
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new FrontmatterCache();
		}
		return this.instance;
	}
}
