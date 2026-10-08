import { Filter, LoomState, SortDir } from "./types/loom-state";
import { sortRows } from "./sort-rows";

/** View preferences are independent of the shared table data. */
export interface LoomViewState {
	filters: Filter[];
	sorts: { columnId: string; direction: SortDir }[];
}

export function getViewState(state: LoomState): LoomViewState {
	return {
		filters: state.model.filters,
		sorts: state.model.columns.map(({ id, sortDir }) => ({
			columnId: id,
			direction: sortDir,
		})),
	};
}

export function applyViewState(state: LoomState, view: LoomViewState): LoomState {
	const directions = new Map(view.sorts.map(sort => [sort.columnId, sort.direction]));
	return sortRows({
		...state,
		model: {
			...state.model,
			// A deleted column or a changed type must not leave an invalid filter.
			filters: view.filters.filter(filter => state.model.columns.some(
				column => column.id === filter.columnId && column.type === filter.type
			)),
			columns: state.model.columns.map(column => ({
				...column,
				sortDir: directions.get(column.id) ?? SortDir.NONE,
			})),
		},
	});
}

/** Keep the file's legacy defaults when saving edits made in a local view. */
export function getSharedState(state: LoomState, defaults: LoomViewState): LoomState {
	return applyViewState({
		...state,
		model: {
			...state.model,
			// Sorts only affect presentation. The index remains the manual row order.
			rows: [...state.model.rows].sort((a, b) => a.index - b.index),
		},
	}, defaults);
}
