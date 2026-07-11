import React from "react";

import { Source } from "src/shared/loom-state/types/loom-state";
import { useLoomState } from "src/react/loom-app/loom-state-provider";
import SourceAddCommand from "src/shared/loom-state/commands/source-add-command";
import SourceDeleteCommand from "src/shared/loom-state/commands/source-delete-command";
import updateStateFromSources, {
	preserveSourceRowOrder,
} from "src/shared/loom-state/update-state-from-sources";
import { useAppMount } from "src/react/loom-app/app-mount-provider";
import EventManager from "src/shared/event/event-manager";
import SourceUpdateCommand from "src/shared/loom-state/commands/source-update-command";
import Logger from "js-logger";

const HOOK_NAME = "useSource";

export const useSource = () => {
	const { app } = useAppMount();
	const { doCommand, loomState, setLoomState } = useLoomState();

	const { sources, columns } = loomState.model;

	const frontmatterKeyHash = JSON.stringify(
		columns.map((column) => column.frontmatterKey)
	);
	const sourcesHash = JSON.stringify(sources);

	const updateRowsFromSources = React.useCallback(
		(fromObsidianEvent = true) => {
			Logger.trace(HOOK_NAME, "updateRowsFromSources", "called");
			setLoomState((prevState) => {
				if (fromObsidianEvent) {
					if (Date.now() - prevState.time < 1000) {
						Logger.trace(
							HOOK_NAME,
							"updateRowsFromSource",
							"event ignored because it was called in the last 1000ms."
						);
						return prevState;
					}
				}
				const { sources, columns, rows } = prevState.state.model;
				const result = updateStateFromSources(
					app,
					sources,
					columns,
					rows.length
				);
				const { newRows, nextColumns } = result;
				const internalRows = rows.filter(
					(row) => row.sourceId === null
				);
				//Keep the saved id and index of source rows that still exist so that
				//user reordering persists across refreshes and reopens (legacy #952)
				const mergedSourceRows = preserveSourceRowOrder(
					rows,
					newRows,
					nextColumns
				);
				const nextRows = [...internalRows, ...mergedSourceRows]
					.sort((a, b) => a.index - b.index)
					.map((row, i) => ({ ...row, index: i }));

				return {
					state: {
						...prevState.state,
						model: {
							...prevState.state.model,
							rows: nextRows,
							columns: nextColumns,
						},
					},
					shouldSaveToDisk: false,
					shouldSaveFrontmatter: true,
					time: Date.now(),
				};
			});
		},
		[app, setLoomState]
	);

	React.useEffect(() => {
		updateRowsFromSources(false);
	}, [sourcesHash, frontmatterKeyHash, updateRowsFromSources]);

	React.useEffect(() => {
		const handler = () => updateRowsFromSources();

		EventManager.getInstance().on("file-create", handler);
		EventManager.getInstance().on("file-frontmatter-change", handler);
		EventManager.getInstance().on("property-type-change", handler);
		EventManager.getInstance().on("file-delete", handler);
		EventManager.getInstance().on("folder-delete", handler);
		EventManager.getInstance().on("folder-rename", handler);
		EventManager.getInstance().on("file-rename", handler);

		return () => {
			EventManager.getInstance().off("file-create", handler);
			EventManager.getInstance().off("file-frontmatter-change", handler);
			EventManager.getInstance().off("property-type-change", handler);
			EventManager.getInstance().off("folder-rename", handler);
			EventManager.getInstance().off("file-rename", handler);
			EventManager.getInstance().off("file-delete", handler);
			EventManager.getInstance().off("folder-delete", handler);
		};
	}, [updateRowsFromSources, app]);

	function handleSourceAdd(source: Source) {
		Logger.trace("handleSourceAdd");
		doCommand(new SourceAddCommand(source));
	}

	function handleSourceDelete(id: string) {
		Logger.trace("handleSourceDelete", { id });
		doCommand(new SourceDeleteCommand(id));
	}

	function handleSourceUpdate(id: string, data: Partial<Source>) {
		Logger.trace("handleSourceUpdate", {
			id,
			data,
		});
		doCommand(new SourceUpdateCommand(id, data));
	}

	return {
		onSourceAdd: handleSourceAdd,
		onSourceDelete: handleSourceDelete,
		onSourceUpdate: handleSourceUpdate,
	};
};
