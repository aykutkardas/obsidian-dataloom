import { LoomState } from "../types";
import { Column, Tag } from "../types/loom-state";
import ColumnNotFoundError from "src/shared/error/column-not-found-error";
import LoomStateCommand from "./loom-state-command";

/**
 * Moves a tag to the position of another tag within a column's tag list.
 * This lets the user reorder tags by dragging (issue #3).
 */
export default class TagReorderCommand extends LoomStateCommand {
	private columnId: string;
	private dragId: string;
	private targetId: string;

	constructor(columnId: string, dragId: string, targetId: string) {
		super(false);
		this.columnId = columnId;
		this.dragId = dragId;
		this.targetId = targetId;
	}

	execute(prevState: LoomState): LoomState {
		const { columns } = prevState.model;

		const column = columns.find((column) => column.id === this.columnId);
		if (!column) throw new ColumnNotFoundError({ id: this.columnId });

		const { tags } = column;
		const dragIndex = tags.findIndex((tag) => tag.id === this.dragId);
		const targetIndex = tags.findIndex((tag) => tag.id === this.targetId);
		if (dragIndex === -1 || targetIndex === -1)
			throw new Error("Tag not found");

		const nextTags: Tag[] = [...tags];
		const draggedEl = nextTags[dragIndex];
		//Remove the element
		nextTags.splice(dragIndex, 1);
		//Insert it at the new location
		nextTags.splice(targetIndex, 0, draggedEl);

		const nextColumns: Column[] = columns.map((column) =>
			column.id === this.columnId ? { ...column, tags: nextTags } : column
		);

		const nextState = {
			...prevState,
			model: {
				...prevState.model,
				columns: nextColumns,
			},
		};
		this.finishExecute(prevState, nextState);
		return nextState;
	}
}
