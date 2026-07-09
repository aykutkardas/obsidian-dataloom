import {
	createFilterGroup,
	createLoomState,
	createTextFilter,
} from "../loom-state-factory";
import FilterGroupDeleteCommand from "./filter-group-delete-command";

describe("filter-group-delete-command", () => {
	it("deletes the group with the given id", () => {
		//Arrange
		const prevState = createLoomState(1, 1);
		const { id: columnId } = prevState.model.columns[0];
		const groupA = createFilterGroup("A", [createTextFilter(columnId)]);
		const groupB = createFilterGroup("B", [createTextFilter(columnId)]);
		prevState.model.filterGroups.push(groupA, groupB);

		const command = new FilterGroupDeleteCommand(groupA.id);

		//Act
		const executeState = command.execute(prevState);

		//Assert
		expect(executeState.model.filterGroups.length).toEqual(1);
		expect(executeState.model.filterGroups[0].id).toEqual(groupB.id);
	});

	it("leaves the active filters untouched", () => {
		//Arrange
		const prevState = createLoomState(1, 1);
		const { id: columnId } = prevState.model.columns[0];
		prevState.model.filters.push(createTextFilter(columnId));
		const group = createFilterGroup("A", [createTextFilter(columnId)]);
		prevState.model.filterGroups.push(group);

		const command = new FilterGroupDeleteCommand(group.id);

		//Act
		const executeState = command.execute(prevState);

		//Assert
		expect(executeState.model.filters.length).toEqual(1);
	});
});
