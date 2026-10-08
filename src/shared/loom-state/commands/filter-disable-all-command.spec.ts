import { createLoomState, createTextFilter } from "../loom-state-factory";
import FilterDisableAllCommand from "./filter-disable-all-command";
it("disables all filters without deleting rules and supports one-step undo/redo", () => {
 const state = createLoomState(1, 1);
 const id = state.model.columns[0].id;
 state.model.filters = [createTextFilter(id, { text: "keep" }), createTextFilter(id, { text: "other" }), createTextFilter(id, { isEnabled: false })];
 const command = new FilterDisableAllCommand();
 const result = command.execute(state);
 expect(result.model.filters).toEqual(state.model.filters.map(f => ({ ...f, isEnabled: false })));
 expect(state.model.filters[0].isEnabled).toBe(true);
 const undo = command.undo(result);
 expect(undo).toEqual(state);
 expect(command.redo(undo)).toEqual(result);
});
