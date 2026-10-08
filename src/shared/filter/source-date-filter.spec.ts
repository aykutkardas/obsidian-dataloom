import { doesSourceDateMatchFilter } from "./source-date-filter";
import { DateFilterCondition, DateFilterOption } from "../loom-state/types/loom-state";

it("matches an absolute source date", () => {
	expect(doesSourceDateMatchFilter("2024-03-01", DateFilterCondition.IS_BEFORE, "2024-03-12")).toBe(true);
	expect(doesSourceDateMatchFilter("2025-03-01", DateFilterCondition.IS_BEFORE, "2024-03-12")).toBe(false);
});
it("keeps a saved relative source filter dynamic", () => {
	expect(doesSourceDateMatchFilter(new Date().toISOString(), DateFilterCondition.IS, DateFilterOption.TODAY)).toBe(true);
});
