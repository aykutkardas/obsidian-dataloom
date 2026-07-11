import { App } from "obsidian";

import {
	CellType,
	Column,
	Row,
	SourceFileCell,
} from "src/shared/loom-state/types/loom-state";

/**
 * Gets the frontmatter property names used by files represented by external
 * source rows. Obsidian's property registry is vault-wide, so it cannot be
 * used on its own for a source-scoped picker.
 */
export const getSourcePropertyNames = (
	app: App,
	columns: Column[],
	rows: Row[]
): Set<string> => {
	const sourceFileColumn = columns.find(
		(column) => column.type === CellType.SOURCE_FILE
	);
	if (!sourceFileColumn) return new Set();

	const propertyNames = new Set<string>();
	rows.forEach((row) => {
		if (row.sourceId === null) return;

		const sourceFileCell = row.cells.find(
			(cell) => cell.columnId === sourceFileColumn.id
		) as SourceFileCell | undefined;
		if (!sourceFileCell?.path) return;

		const frontmatter = app.metadataCache.getCache(
			sourceFileCell.path
		)?.frontmatter;
		if (!frontmatter) return;

		Object.keys(frontmatter).forEach((key) => {
			// `position` is parser metadata, not a user frontmatter property.
			if (key !== "position") propertyNames.add(key);
		});
	});

	return propertyNames;
};
