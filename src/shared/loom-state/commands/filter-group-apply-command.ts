import { cloneDeep } from "es-toolkit";
import { LoomState } from "../types";
import { Filter } from "../types/loom-state";
import { cloneFilterWithNewId } from "../loom-state-factory";
import LoomStateCommand from "./loom-state-command";

/**
 * Replaces the active filters with a copy of the saved group's filters.
 * Each filter is cloned with a new id so it becomes an independent active
 * filter that can be edited without affecting the saved group.
 */
export default class FilterGroupApplyCommand extends LoomStateCommand {
	private groupId: string;

	constructor(groupId: string) {
		super(false);
		this.groupId = groupId;
	}

	execute(prevState: LoomState): LoomState {
		const { filterGroups } = prevState.model;

		const group = filterGroups.find((group) => group.id === this.groupId);
		if (!group) throw new Error("Filter group not found");

		const nextFilters: Filter[] = group.filters.map((filter) =>
			cloneFilterWithNewId(cloneDeep(filter))
		);

		const nextState = {
			...prevState,
			model: {
				...prevState.model,
				filters: nextFilters,
			},
		};
		this.finishExecute(prevState, nextState);
		return nextState;
	}
}
