import { randomUnusedColor } from "./color";
import { Color } from "./loom-state/types/loom-state";

describe("randomUnusedColor", () => {
	const allColors = Object.values(Color);

	it("returns an unused color when one is available", () => {
		const used = allColors.slice(0, allColors.length - 1);
		const remaining = allColors[allColors.length - 1];

		//Deterministic: only one color is unused
		const result = randomUnusedColor(used);
		expect(result).toEqual(remaining);
	});

	it("never returns a used color while unused colors remain", () => {
		const used = [Color.RED, Color.BLUE];
		for (let i = 0; i < 50; i++) {
			const result = randomUnusedColor(used);
			expect(used).not.toContain(result);
		}
	});

	it("avoids the most recently used color when all colors are used", () => {
		//Every color used once - the most recent is RED
		const used = [...allColors.filter((c) => c !== Color.RED), Color.RED];
		for (let i = 0; i < 50; i++) {
			const result = randomUnusedColor(used);
			expect(result).not.toEqual(Color.RED);
		}
	});

	it("prefers the least-used colors when all colors are used", () => {
		//All colors used once, GREEN used twice
		const used = [...allColors, Color.GREEN];
		for (let i = 0; i < 50; i++) {
			const result = randomUnusedColor(used);
			expect(result).not.toEqual(Color.GREEN);
		}
	});
});
