import { App, EventRef } from "obsidian";
import { ObsidianPropertyType } from "./types";

/**
 * Information about a vault property.
 * Older Obsidian versions expose the property type as `type`,
 * Obsidian 1.9+ exposes it as `widget`.
 */
interface PropertyInfo {
	name: string;
	type?: string;
	widget?: string;
}

export interface AppWithMetadataTypeManager extends App {
	metadataTypeManager: {
		setType: (name: string, type: ObsidianPropertyType) => Promise<void>;
		getAllProperties: () => Record<string, PropertyInfo>;
		/**
		 * Removed in Obsidian 1.9+. Replaced by `getAssignedWidget`.
		 */
		getAssignedType?: (name: string) => ObsidianPropertyType | null;
		/**
		 * Available in Obsidian 1.9+. Replaces `getAssignedType`.
		 */
		getAssignedWidget?: (name: string) => string | null;
		on: (
			name: "changed",
			callback: (propertyName: string) => void
		) => EventRef;
	};
}

const OBSIDIAN_PROPERTY_TYPES = Object.values(ObsidianPropertyType) as string[];

/**
 * Narrows an unknown property type value coming from the Obsidian internals
 * to one of the property types this plugin understands.
 */
export const toObsidianPropertyType = (
	value: unknown
): ObsidianPropertyType | null => {
	if (typeof value !== "string") return null;
	if (!OBSIDIAN_PROPERTY_TYPES.includes(value)) return null;
	return value as ObsidianPropertyType;
};

/**
 * Updates the type of an existing Obsidian property
 *
 * NOTE: This is an undocumented API function and may break in future versions of Obsidian
 */
export const updateObsidianPropertyType = (
	app: App,
	name: string,
	type: ObsidianPropertyType
): Promise<void> => {
	return (app as AppWithMetadataTypeManager).metadataTypeManager.setType(
		name,
		type
	);
};

/**
 * Gets all Obsidian properties
 *
 * NOTE: This is an undocumented API function and may break in future versions of Obsidian
 */
export const getAllObsidianProperties = (app: App) => {
	return (
		app as AppWithMetadataTypeManager
	).metadataTypeManager.getAllProperties();
};

/**
 * Gets the type of an Obsidian property
 *
 * NOTE: This is an undocumented API. `getAssignedType` was removed in
 * Obsidian 1.9+ in favor of `getAssignedWidget`, so both are tried. Any
 * failure returns null instead of crashing the table (issue #2); callers
 * fall back to the text property type.
 */
export const getAssignedPropertyType = (
	app: App,
	name: string
): ObsidianPropertyType | null => {
	const manager = (app as AppWithMetadataTypeManager).metadataTypeManager;
	try {
		if (typeof manager.getAssignedType === "function") {
			return manager.getAssignedType(name);
		}
		if (typeof manager.getAssignedWidget === "function") {
			return toObsidianPropertyType(manager.getAssignedWidget(name));
		}
	} catch {
		//Fall through to the property info lookup below
	}
	try {
		const info = manager.getAllProperties()[name.toLowerCase()];
		if (info) return toObsidianPropertyType(info.widget ?? info.type);
	} catch {
		//Ignore - the API surface changed in an unexpected way
	}
	return null;
};
