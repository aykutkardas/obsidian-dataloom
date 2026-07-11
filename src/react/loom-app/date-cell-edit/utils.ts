import {
	DateFormat,
	DateFormatSeparator,
} from "src/shared/loom-state/types/loom-state";
import { dateTimeToDateString } from "src/shared/date/date-time-conversion";
import { dateStringToDateTime } from "src/shared/date/date-string-conversion";
import { isValidDateString } from "src/shared/date/date-validation";

export const getDatePickerValue = (
	dateString: string,
	dateFormat: DateFormat,
	dateFormatSeparator: DateFormatSeparator
) => {
	if (
		!isValidDateString(dateString, dateFormat, dateFormatSeparator)
	)
		return "";

	const dateTime = dateStringToDateTime(
		dateString,
		dateFormat,
		dateFormatSeparator
	);
	return dateTimeToDateString(
		dateTime,
		DateFormat.YYYY_MM_DD,
		DateFormatSeparator.HYPHEN
	);
};

export const getDateStringFromPickerValue = (
	pickerValue: string,
	dateFormat: DateFormat,
	dateFormatSeparator: DateFormatSeparator
) => {
	if (pickerValue === "") return "";

	const dateTime = dateStringToDateTime(
		pickerValue,
		DateFormat.YYYY_MM_DD,
		DateFormatSeparator.HYPHEN
	);
	return dateTimeToDateString(
		dateTime,
		dateFormat,
		dateFormatSeparator
	);
};
