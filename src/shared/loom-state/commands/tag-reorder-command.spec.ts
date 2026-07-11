import { createLoomState, createTag } from "../loom-state-factory";
import TagReorderCommand from "./tag-reorder-command";

describe("tag-reorder-command", () => {
	it("moves the dragged tag to the target position", () => {
		//Arrange
		const prevState = createLoomState(1, 1);
		const column = prevState.model.columns[0];
		const tagA = createTag("a");
		const tagB = createTag("b");
		const tagC = createTag("c");
		column.tags.push(tagA, tagB, tagC);

		const command = new TagReorderCommand(column.id, tagA.id, tagC.id);

		//Act
		const executeState = command.execute(prevState);

		//Assert
		const tags = executeState.model.columns[0].tags;
		expect(tags.map((t) => t.content)).toEqual(["b", "c", "a"]);
	});

	it("can be undone", () => {
		//Arrange
		const prevState = createLoomState(1, 1);
		const column = prevState.model.columns[0];
		const tagA = createTag("a");
		const tagB = createTag("b");
		column.tags.push(tagA, tagB);

		const command = new TagReorderCommand(column.id, tagB.id, tagA.id);

		//Act
		const executeState = command.execute(prevState);
		const undoState = command.undo(executeState);

		//Assert
		expect(undoState.model.columns[0].tags.map((t) => t.content)).toEqual([
			"a",
			"b",
		]);
	});

	it("throws when the tag does not exist", () => {
		const prevState = createLoomState(1, 1);
		const column = prevState.model.columns[0];
		const command = new TagReorderCommand(column.id, "missing", "missing2");
		expect(() => command.execute(prevState)).toThrow();
	});
});
