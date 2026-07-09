import {
	createFilterGroup,
	createLoomState,
	createTextFilter,
} from "../loom-state-factory";
import FilterGroupApplyCommand from "./filter-group-apply-command";

describe("filter-group-apply-command", () => {
	it("replaces the active filters with clones of the group's filters", () => {
		//Arrange
		const prevState = createLoomState(1, 1);
		const { id: columnId } = prevState.model.columns[0];

		//An unrelated active filter that should be replaced
		prevState.model.filters.push(createTextFilter(columnId));

		const groupFilter = createTextFilter(columnId, { text: "saved" });
		const group = createFilterGroup("My group", [groupFilter]);
		prevState.model.filterGroups.push(group);

		const command = new FilterGroupApplyCommand(group.id);

		//Act
		const executeState = command.execute(prevState);

		//Assert
		expect(executeState.model.filters.length).toEqual(1);
		const applied = executeState.model.filters[0];
		expect(applied.type).toEqual(groupFilter.type);
		expect(applied.columnId).toEqual(groupFilter.columnId);
		//Cloned with a new id so it is independent from the saved group
		expect(applied.id).not.toEqual(groupFilter.id);
		//The saved group itself is untouched
		expect(executeState.model.filterGroups[0].filters[0].id).toEqual(
			groupFilter.id
		);
	});

	it("throws when the group does not exist", () => {
		const prevState = createLoomState(1, 1);
		const command = new FilterGroupApplyCommand("missing-id");
		expect(() => command.execute(prevState)).toThrow();
	});
});
