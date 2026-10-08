/** @jest-environment jsdom */
import { App } from "obsidian";
import { findActiveLeafForUpdate } from "./editing-view-plugin-utils";

describe("findActiveLeafForUpdate", () => {
	const createLeaf = (editor: unknown) => ({ view: { editor } });

	it("skips leaves whose editor is not ready yet", () => {
		const notReady = createLeaf(undefined);
		const ready = createLeaf({ cm: "view-b" });
		const app = {
			workspace: { getLeavesOfType: () => [notReady, ready] },
		} as unknown as App;

		expect(
			findActiveLeafForUpdate(app, { view: "view-b" } as never)
		).toBe(ready);
	});

	it("returns undefined when no leaf editor matches", () => {
		const app = {
			workspace: { getLeavesOfType: () => [createLeaf(undefined)] },
		} as unknown as App;
		expect(
			findActiveLeafForUpdate(app, { view: "view-x" } as never)
		).toBeUndefined();
	});
});
