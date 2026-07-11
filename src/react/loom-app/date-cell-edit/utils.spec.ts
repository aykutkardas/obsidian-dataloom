import {
	DateFormat,
	DateFormatSeparator,
} from "src/shared/loom-state/types/loom-state";
import {
	getDatePickerValue,
	getDateStringFromPickerValue,
} from "./utils";

describe("date-cell-edit utils", () => {
	it("converts a formatted date to the native picker format", () => {
		expect(
			getDatePickerValue(
				"31/12/2026",
				DateFormat.DD_MM_YYYY,
				DateFormatSeparator.SLASH
			)
		).toBe("2026-12-31");
	});

	it("does not send invalid manual input to the native picker", () => {
		expect(
			getDatePickerValue(
				"not-a-date",
				DateFormat.MM_DD_YYYY,
				DateFormatSeparator.HYPHEN
			)
		).toBe("");
	});

	it("converts a picker value to the configured display format", () => {
		expect(
			getDateStringFromPickerValue(
				"2026-12-31",
				DateFormat.MM_DD_YYYY,
				DateFormatSeparator.DOT
			)
		).toBe("12.31.2026");
	});

	it("clears the display value when the picker is cleared", () => {
		expect(
			getDateStringFromPickerValue(
				"",
				DateFormat.MM_DD_YYYY,
				DateFormatSeparator.HYPHEN
			)
		).toBe("");
	});
});
