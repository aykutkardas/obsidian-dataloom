import { cloneDeep } from "es-toolkit";
import { LoomState } from "../types";
import { Filter } from "../types/loom-state";
import { createFilterGroup } from "../loom-state-factory";
import LoomStateCommand from "./loom-state-command";

/**
 * Saves the currently active filters as a named, reusable group.
 */
export default class FilterGroupSaveCommand extends LoomStateCommand {
	private name: string;

	constructor(name: string) {
		super(false);
		this.name = name;
	}

	execute(prevState: LoomState): LoomState {
		const { filters, filterGroups } = prevState.model;

		//Deep copy the active filters so that later edits to them don't mutate
		//the saved group
		const savedFilters: Filter[] = filters.map((filter) =>
			cloneDeep(filter)
		);
		const newGroup = createFilterGroup(this.name, savedFilters);

		const nextState = {
			...prevState,
			model: {
				...prevState.model,
				filterGroups: [...filterGroups, newGroup],
			},
		};
		this.finishExecute(prevState, nextState);
		return nextState;
	}
}
