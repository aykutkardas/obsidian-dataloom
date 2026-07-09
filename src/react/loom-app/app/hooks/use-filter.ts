import { Filter } from "src/shared/loom-state/types/loom-state";
import { filterByFilters } from "../filter-by-filters";
import { useLoomState } from "../../loom-state-provider";
import FilterUpdateCommand from "src/shared/loom-state/commands/filter-update-command";
import FilterAddCommand from "src/shared/loom-state/commands/filter-add-command";
import FilterDeleteCommand from "src/shared/loom-state/commands/filter-delete-command";
import FilterGroupSaveCommand from "src/shared/loom-state/commands/filter-group-save-command";
import FilterGroupApplyCommand from "src/shared/loom-state/commands/filter-group-apply-command";
import FilterGroupDeleteCommand from "src/shared/loom-state/commands/filter-group-delete-command";
import Logger from "js-logger";

export const useFilter = () => {
	const { doCommand } = useLoomState();

	function handleFilterUpdate(
		id: string,
		data: Partial<Filter>,
		isPartial?: boolean
	) {
		Logger.trace("handleFilterUpdate", { id, data });
		doCommand(new FilterUpdateCommand<Filter>(id, data, isPartial));
	}

	function handleFilterAdd() {
		Logger.trace("handleFilterAdd");
		doCommand(new FilterAddCommand());
	}

	function handleFilterDelete(id: string) {
		Logger.trace("handleFilterDelete", { id });
		doCommand(new FilterDeleteCommand(id));
	}

	function handleFilterGroupSave(name: string) {
		Logger.trace("handleFilterGroupSave", { name });
		doCommand(new FilterGroupSaveCommand(name));
	}

	function handleFilterGroupApply(groupId: string) {
		Logger.trace("handleFilterGroupApply", { groupId });
		doCommand(new FilterGroupApplyCommand(groupId));
	}

	function handleFilterGroupDelete(groupId: string) {
		Logger.trace("handleFilterGroupDelete", { groupId });
		doCommand(new FilterGroupDeleteCommand(groupId));
	}

	return {
		onFilterAdd: handleFilterAdd,
		onFilterUpdate: handleFilterUpdate,
		onFilterDelete: handleFilterDelete,
		onFilterGroupSave: handleFilterGroupSave,
		onFilterGroupApply: handleFilterGroupApply,
		onFilterGroupDelete: handleFilterGroupDelete,
		filterByFilters,
	};
};
