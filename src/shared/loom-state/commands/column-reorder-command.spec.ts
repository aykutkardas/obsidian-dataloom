import ColumnReorderCommand from "./column-reorder-command";
import { createLoomState } from "../loom-state-factory";

describe("column-update-command", () => {
	it("moves the last column to the first column index when execute() is called", () => {
		//Arrange
		const prevState = createLoomState(3, 1);
		const firstColumn = prevState.model.columns[0].id;
		const lastColumn = prevState.model.columns[2].id;
		const command = new ColumnReorderCommand(lastColumn, firstColumn);

		//Act
		const executeState = command.execute(prevState);

		//Assert
		expect(executeState.model.columns[0].id).toEqual(lastColumn);
		expect(executeState.model.columns[1].id).toEqual(firstColumn);
		expect(executeState.model.columns[2].id).toEqual(
			prevState.model.columns[1].id
		);
	});

	it("keeps cells attached to their columns by id when execute() is called", () => {
		//Arrange
		const prevState = createLoomState(3, 2);
		const firstColumn = prevState.model.columns[0].id;
		const lastColumn = prevState.model.columns[2].id;
		const command = new ColumnReorderCommand(lastColumn, firstColumn);

		//Act
		const executeState = command.execute(prevState);

		//Assert
		executeState.model.rows.forEach((row) => {
			const cellColumnIds = row.cells.map((cell) => cell.columnId);
			expect(cellColumnIds).toEqual(
				executeState.model.columns.map((column) => column.id)
			);
		});
	});

	it("does not mutate the previous state when execute() is called", () => {
		//Arrange
		const prevState = createLoomState(3, 2);
		const originalCellOrder = prevState.model.rows.map((row) =>
			row.cells.map((cell) => cell.columnId)
		);
		const firstColumn = prevState.model.columns[0].id;
		const lastColumn = prevState.model.columns[2].id;
		const command = new ColumnReorderCommand(lastColumn, firstColumn);

		//Act
		command.execute(prevState);

		//Assert
		const cellOrderAfterExecute = prevState.model.rows.map((row) =>
			row.cells.map((cell) => cell.columnId)
		);
		expect(cellOrderAfterExecute).toEqual(originalCellOrder);
	});

	it("restores the original column and cell order when undo() is called", () => {
		//Arrange
		const prevState = createLoomState(3, 2);
		const originalColumnOrder = prevState.model.columns.map(
			(column) => column.id
		);
		const originalCellOrder = prevState.model.rows.map((row) =>
			row.cells.map((cell) => cell.columnId)
		);
		const firstColumn = prevState.model.columns[0].id;
		const lastColumn = prevState.model.columns[2].id;
		const command = new ColumnReorderCommand(lastColumn, firstColumn);

		//Act
		const executeState = command.execute(prevState);
		const undoState = command.undo(executeState);

		//Assert
		expect(undoState.model.columns.map((column) => column.id)).toEqual(
			originalColumnOrder
		);
		expect(
			undoState.model.rows.map((row) =>
				row.cells.map((cell) => cell.columnId)
			)
		).toEqual(originalCellOrder);
	});
});
