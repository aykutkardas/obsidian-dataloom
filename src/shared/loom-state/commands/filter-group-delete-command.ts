import { LoomState } from "../types";
import { FilterGroup } from "../types/loom-state";
import LoomStateCommand from "./loom-state-command";

/**
 * Deletes a saved filter group. The active filters are left untouched.
 */
export default class FilterGroupDeleteCommand extends LoomStateCommand {
	private groupId: string;

	constructor(groupId: string) {
		super(false);
		this.groupId = groupId;
	}

	execute(prevState: LoomState): LoomState {
		const { filterGroups } = prevState.model;
		const nextGroups: FilterGroup[] = filterGroups.filter(
			(group) => group.id !== this.groupId
		);

		const nextState = {
			...prevState,
			model: {
				...prevState.model,
				filterGroups: nextGroups,
			},
		};
		this.finishExecute(prevState, nextState);
		return nextState;
	}
}
