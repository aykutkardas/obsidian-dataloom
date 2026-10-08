import { vi } from "vitest";
import CellBodyUpdateCommand from "./cell-body-update-command";
import { createLoomState } from "../loom-state-factory";
import { TextCell } from "../types/loom-state";

describe("cell-update-command", () => {
	beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
	afterEach(() => vi.useRealTimers());
	it("should update a cell property when execute() is called", () => {
		//Arrange
		const prevState = createLoomState(1, 1);
		const command = new CellBodyUpdateCommand(
			prevState.model.rows[0].cells[0].id,
			{
				content: "test",
			}
		);

		//Act
		vi.setSystemTime(Date.now() + 100);
		const executeState = command.execute(prevState);
		vi.useRealTimers();

		//Assert
		expect(executeState.model.rows.length).toEqual(1);
		expect(executeState.model.rows[0].cells.length).toEqual(1);
		expect(
			(executeState.model.rows[0].cells[0] as TextCell).content
		).toEqual("test");

		const executeLastEditedDateTime = new Date(
			executeState.model.rows[0].lastEditedDateTime
		).getTime();
		const prevLastEditedDateTime = new Date(
			prevState.model.rows[0].lastEditedDateTime
		).getTime();

		expect(executeLastEditedDateTime).toBeGreaterThan(
			prevLastEditedDateTime
		);
	});
});
