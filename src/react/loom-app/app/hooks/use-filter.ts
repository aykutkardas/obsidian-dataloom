import { Filter } from "src/shared/loom-state/types/loom-state";
import { filterByFilters } from "../filter-by-filters";
import { useLoomState } from "../../loom-state-provider";
import FilterUpdateCommand from "src/shared/loom-state/commands/filter-update-command";
import FilterAddCommand from "src/shared/loom-state/commands/filter-add-command";
import FilterDeleteCommand from "src/shared/loom-state/commands/filter-delete-command";
import Logger from "js-logger";
import FilterDisableAllCommand from "src/shared/loom-state/commands/filter-disable-all-command";

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

	function handleFilterDisableAll() {
		doCommand(new FilterDisableAllCommand());
	}

	return {
		onFilterDisableAll: handleFilterDisableAll,
		onFilterAdd: handleFilterAdd,
		onFilterUpdate: handleFilterUpdate,
		onFilterDelete: handleFilterDelete,
		filterByFilters,
	};
};
