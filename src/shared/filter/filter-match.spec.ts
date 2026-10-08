import { doesDateMatchFilter } from "./filter-match";
import { DateFilterCondition, DateFilterOption } from "../loom-state/types/loom-state";

describe("absolute and legacy date filters", () => {
	it("uses local calendar days for date-only cells", () => {
		expect(doesDateMatchFilter("2024-02-29", DateFilterCondition.IS, DateFilterOption.UNSELECTED, "2024-02-29", true)).toBe(true);
	});
	it.each([
		[DateFilterCondition.IS, "2024-02-29T23:59:59", true],
		[DateFilterCondition.IS_BEFORE, "2024-02-28T23:59:59", true],
		[DateFilterCondition.IS_BEFORE, "2024-02-29T00:00:00", false],
		[DateFilterCondition.IS_AFTER, "2024-02-29T23:59:59", false],
		[DateFilterCondition.IS_AFTER, "2024-03-01T00:00:00", true],
	])("compares whole calendar days with %s", (condition, value, expected) => {
		expect(doesDateMatchFilter(value, condition, DateFilterOption.UNSELECTED, "2024-02-29", true)).toBe(expected);
	});
	it("preserves relative today filters", () => {
		expect(doesDateMatchFilter(new Date().toISOString(), DateFilterCondition.IS, DateFilterOption.TODAY, null, true)).toBe(true);
	});
	it.each([null, "", "abc", "0000", "2024.5"])("handles incomplete or invalid year %s", year => {
		expect(doesDateMatchFilter("2024-06-01", DateFilterCondition.IS_IN_YEAR, DateFilterOption.UNSELECTED, year, true)).toBe(year === null || year === "");
	});
	it("ignores an unfinished range", () => {
		expect(doesDateMatchFilter("2025-06-01", DateFilterCondition.IS_BETWEEN, DateFilterOption.UNSELECTED, "2024-01-01", true)).toBe(true);
	});
	it.each(["2023-12-31", "invalid", "2024-02-30"])("rejects a reversed or invalid range end %s", end => {
		expect(doesDateMatchFilter("2024-02-01", DateFilterCondition.IS_BETWEEN, DateFilterOption.UNSELECTED, "2024-01-01", true, end)).toBe(false);
	});
});

describe("year filters", () => {
	it.each([
		["2024-01-01T00:00:00", true],
		["2024-12-31T23:59:59.999", true],
		["2025-01-01T00:00:00", false],
		[null, false],
	])("matches only the selected calendar year: %s", (value, expected) => {
		expect(doesDateMatchFilter(value, DateFilterCondition.IS_IN_YEAR,
			DateFilterOption.UNSELECTED, "2024", true)).toBe(expected);
	});
});

describe("date range filters", () => {
	it.each([
		["2024-01-01T00:00:00", true],
		["2024-12-31T23:59:59.999", true],
		["2023-12-31T23:59:59.999", false],
		["2025-01-01T00:00:00", false],
		[null, false],
	])("includes both boundary days: %s", (value, expected) => {
		expect(doesDateMatchFilter(value, DateFilterCondition.IS_BETWEEN,
			DateFilterOption.UNSELECTED, "2024-01-01", true, "2024-12-31"))
			.toBe(expected);
	});
});
