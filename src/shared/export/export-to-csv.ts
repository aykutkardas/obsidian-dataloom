import Papa from "papaparse";

import { loomStateToArray } from "src/shared/export/loom-state-to-array";
import { LoomState } from "src/shared/loom-state/types/loom-state";
import { App } from "obsidian";

export const exportToCSV = (
	app: App,
	loomState: LoomState,
	shouldRemoveMarkdown: boolean
): string => {
	const arr = loomStateToArray(app, loomState, shouldRemoveMarkdown);
	return Papa.unparse(arr);
};
