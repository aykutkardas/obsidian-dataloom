import { shouldUseNativeArrowKeyBehavior } from "./utils";
import { LoomMenuLevel } from "src/react/shared/menu-provider/types";

describe("shouldUseNativeArrowKeyBehavior", () => {
	it("allows textarea arrow keys to move the caret when no menu is open", () => {
		const textarea = document.createElement("textarea");

		expect(shouldUseNativeArrowKeyBehavior(textarea, null)).toBe(true);
	});

	it("allows input arrow keys to use their native behavior", () => {
		const input = document.createElement("input");

		expect(shouldUseNativeArrowKeyBehavior(input, null)).toBe(true);
	});

	it("allows arrow keys inside contenteditable elements", () => {
		const editable = document.createElement("div");
		editable.setAttribute("contenteditable", "true");

		expect(shouldUseNativeArrowKeyBehavior(editable, null)).toBe(true);
	});

	it("allows native arrows in a level-one cell editor", () => {
		const textarea = document.createElement("textarea");

		expect(
			shouldUseNativeArrowKeyBehavior(textarea, LoomMenuLevel.ONE)
		).toBe(true);
	});

	it("keeps menu arrow navigation when a nested menu is open", () => {
		const textarea = document.createElement("textarea");

		expect(
			shouldUseNativeArrowKeyBehavior(textarea, LoomMenuLevel.TWO)
		).toBe(false);
	});

	it("keeps table arrow navigation for non-editable elements", () => {
		const cell = document.createElement("div");

		expect(shouldUseNativeArrowKeyBehavior(cell, null)).toBe(false);
	});
});
