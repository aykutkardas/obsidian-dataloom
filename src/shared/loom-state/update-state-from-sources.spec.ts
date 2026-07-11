import { preserveSourceRowOrder } from "./update-state-from-sources";
import {
	createColumn,
	createRow,
	createSourceFileCell,
	createTextCell,
} from "./loom-state-factory";
import { CellType } from "./types/loom-state";

describe("preserveSourceRowOrder", () => {
	const sourceFileColumn = createColumn({ type: CellType.SOURCE_FILE });
	const textColumn = createColumn({ type: CellType.TEXT });
	const columns = [sourceFileColumn, textColumn];

	const createSourceRow = (index: number, path: string, sourceId: string) =>
		createRow(index, {
			sourceId,
			cells: [
				createSourceFileCell(sourceFileColumn.id, { path }),
				createTextCell(textColumn.id),
			],
		});

	it("keeps the id and index of source rows that still exist", () => {
		//Arrange
		//The user has reordered the source rows: b.md before a.md
		const prevRows = [
			createSourceRow(0, "b.md", "source-1"),
			createSourceRow(1, "a.md", "source-1"),
		];
		//The rows are rebuilt from the source in file order and appended at the end
		const newRows = [
			createSourceRow(2, "a.md", "source-1"),
			createSourceRow(3, "b.md", "source-1"),
		];

		//Act
		const mergedRows = preserveSourceRowOrder(prevRows, newRows, columns);

		//Assert
		const rowA = mergedRows[0];
		const rowB = mergedRows[1];
		expect(rowA.id).toEqual(prevRows[1].id);
		expect(rowA.index).toEqual(1);
		expect(rowB.id).toEqual(prevRows[0].id);
		expect(rowB.index).toEqual(0);
	});

	it("leaves rows for new source files untouched", () => {
		//Arrange
		const prevRows = [createSourceRow(0, "a.md", "source-1")];
		const newRows = [
			createSourceRow(1, "a.md", "source-1"),
			createSourceRow(2, "new-file.md", "source-1"),
		];

		//Act
		const mergedRows = preserveSourceRowOrder(prevRows, newRows, columns);

		//Assert
		expect(mergedRows[0].id).toEqual(prevRows[0].id);
		expect(mergedRows[0].index).toEqual(0);
		expect(mergedRows[1].id).toEqual(newRows[1].id);
		expect(mergedRows[1].index).toEqual(2);
	});

	it("does not match against internal rows", () => {
		//Arrange
		const internalRow = createRow(0, {
			cells: [
				createSourceFileCell(sourceFileColumn.id, { path: "a.md" }),
				createTextCell(textColumn.id),
			],
		});
		const newRows = [createSourceRow(1, "a.md", "source-1")];

		//Act
		const mergedRows = preserveSourceRowOrder(
			[internalRow],
			newRows,
			columns
		);

		//Assert
		expect(mergedRows[0].id).toEqual(newRows[0].id);
	});
});
