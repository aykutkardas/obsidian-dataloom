import { createLoomState, createTextFilter } from "../loom-state-factory";
import FilterGroupSaveCommand from "./filter-group-save-command";

describe("filter-group-save-command", () => {
	it("saves the active filters as a named group", () => {
		//Arrange
		const prevState = createLoomState(1, 1);
		const { id: columnId } = prevState.model.columns[0];
		const textFilter = createTextFilter(columnId, { text: "hello" });
		prevState.model.filters.push(textFilter);

		const command = new FilterGroupSaveCommand("My group");

		//Act
		const executeState = command.execute(prevState);

		//Assert
		expect(executeState.model.filterGroups.length).toEqual(1);
		const group = executeState.model.filterGroups[0];
		expect(group.name).toEqual("My group");
		expect(group.filters).toEqual(prevState.model.filters);
		//The saved filters must be a copy, not the same references
		expect(group.filters[0]).not.toBe(prevState.model.filters[0]);
	});

	it("can be undone", () => {
		//Arrange
		const prevState = createLoomState(1, 1);
		const { id: columnId } = prevState.model.columns[0];
		prevState.model.filters.push(createTextFilter(columnId));

		const command = new FilterGroupSaveCommand("My group");

		//Act
		const executeState = command.execute(prevState);
		const undoState = command.undo(executeState);

		//Assert
		expect(undoState.model.filterGroups.length).toEqual(0);
	});
});
