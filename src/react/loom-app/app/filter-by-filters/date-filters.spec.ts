import { filterByFilters } from "./index";
import { createLoomState, createDateFilter, createDateCell, createCreationTimeFilter, createLastEditedTimeFilter } from "src/shared/loom-state/loom-state-factory";
import { CellType, DateFilterCondition, DateFilter, LoomState } from "src/shared/loom-state/types/loom-state";
import { LoomStateObject } from "src/shared/loom-state/validate-state";

it.each([CellType.DATE, CellType.CREATION_TIME, CellType.LAST_EDITED_TIME])("round-trips and applies a range to %s", (type) => {
	const state = createLoomState(1, 2);
	const column = state.model.columns[0];
	column.type = type;
	state.model.rows.forEach((row, index) => {
		const dateTime = index === 0 ? "2024-12-31T23:59:59.999" : "2025-01-01T00:00:00";
		row.cells = [createDateCell(column.id, { dateTime })];
		row.creationDateTime = dateTime;
		row.lastEditedDateTime = dateTime;
	});
	const factory = type === CellType.DATE ? createDateFilter : type === CellType.CREATION_TIME ? createCreationTimeFilter : createLastEditedTimeFilter;
	state.model.filters = [{ ...factory(column.id, { condition: DateFilterCondition.IS_BETWEEN, dateTime: "2024-01-01" }), endDateTime: "2024-12-31" }];
	const restored = JSON.parse(JSON.stringify(state)) as LoomState;
	expect(LoomStateObject.validate(restored).success).toBe(true);
	expect(filterByFilters(restored).map(row => row.id)).toEqual([state.model.rows[0].id]);
	(restored.model.filters[0] as DateFilter).condition = DateFilterCondition.IS_IN_YEAR;
	(restored.model.filters[0] as DateFilter).dateTime = "2025";
	expect(filterByFilters(restored).map(row => row.id)).toEqual([state.model.rows[1].id]);
});

it("accepts legacy filters without an end date", () => {
	const state = createLoomState(1, 1);
	state.model.filters = [createDateFilter(state.model.columns[0].id)];
	expect(LoomStateObject.validate(JSON.parse(JSON.stringify(state))).success).toBe(true);
});
