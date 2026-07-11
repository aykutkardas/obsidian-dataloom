import { App } from "obsidian";

import { getSourcePropertyNames } from "./get-source-property-names";
import {
	createColumn,
	createRow,
	createSourceFileCell,
} from "src/shared/loom-state/loom-state-factory";
import { CellType } from "src/shared/loom-state/types/loom-state";

describe("getSourcePropertyNames", () => {
	it("returns only properties from external source files", () => {
		const sourceFileColumn = createColumn({ type: CellType.SOURCE_FILE });
		const externalRow = createRow(0, {
			sourceId: "folder-source",
			cells: [
				createSourceFileCell(sourceFileColumn.id, {
					path: "LoomTest/Alpha.md",
				}),
			],
		});
		const internalRow = createRow(1, {
			cells: [
				createSourceFileCell(sourceFileColumn.id, {
					path: "Transactions/Invoice.md",
				}),
			],
		});
		const app = {
			metadataCache: {
				getCache: jest.fn((path: string) => ({
					frontmatter:
						path === "LoomTest/Alpha.md"
							? { status: "active", priority: 3, position: {} }
							: { currency: "TL" },
				})),
			},
		} as unknown as App;

		expect(
			getSourcePropertyNames(app, [sourceFileColumn], [
				externalRow,
				internalRow,
			])
		).toEqual(new Set(["status", "priority"]));
	});
});
