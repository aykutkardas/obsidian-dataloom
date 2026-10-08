import { createLoomState, createTextFilter } from "./loom-state-factory";
import { applyViewState, getSharedState, getViewState } from "./view-state";
import { CellType, SortDir, TextCell } from "./types/loom-state";

it("keeps different sorts and filters while sharing cell edits", () => {
	const state = createLoomState(1, 2);
	const column = state.model.columns[0];
	(state.model.rows[0].cells[0] as TextCell).content = "Zulu";
	(state.model.rows[1].cells[0] as TextCell).content = "Alpha";
	const defaults = getViewState(state);
	const view = { filters: [createTextFilter(column.id)], sorts: [{ columnId: column.id, direction: SortDir.ASC }] };
	const local = applyViewState(state, view);
	expect(local.model.rows.map(row => row.id)).toEqual([...state.model.rows].reverse().map(row => row.id));
	expect(getSharedState(local, defaults)).toEqual(state);
	const shared = structuredClone(state);
	(shared.model.rows[0].cells[0] as TextCell).content = "Aardvark";
	const refreshed = applyViewState(shared, getViewState(local));
	expect(refreshed.model.filters).toEqual(view.filters);
	expect(refreshed.model.columns[0].sortDir).toBe(SortDir.ASC);
	expect((refreshed.model.rows[0].cells[0] as TextCell).content).toBe("Aardvark");
});

it("retains saved legacy defaults when a local view saves data", () => {
	const state = createLoomState(1, 2);
	state.model.columns[0].sortDir = SortDir.DESC;
	state.model.filters = [createTextFilter(state.model.columns[0].id)];
	const defaults = getViewState(state);
	const local = applyViewState(state, { filters: [], sorts: [] });
	(local.model.rows[0].cells[0] as TextCell).content = "Edited";
	const saved = getSharedState(local, defaults);
	expect(saved.model.filters).toEqual(defaults.filters);
	expect(saved.model.columns[0].sortDir).toBe(SortDir.DESC);
	expect(saved.model.rows.some(row => (row.cells[0] as TextCell).content === "Edited")).toBe(true);
});

it("drops local filters whose columns were deleted or changed type", () => {
	const state = createLoomState(2, 0);
	const view = getViewState(state);
	view.filters = state.model.columns.map(column => createTextFilter(column.id));
	state.model.columns.pop();
	state.model.columns[0].type = CellType.NUMBER;
	expect(applyViewState(state, view).model.filters).toEqual([]);
});
