import "./styles.css";
import FormattedDatePicker from "../formatted-date-picker";
import { getDisplayNameForDateFilterOption } from "src/shared/loom-state/type-display-names";
import { DateFilterCondition, DateFilterOption, DateFormat, DateFormatSeparator } from "src/shared/loom-state/types/loom-state";
import { getDateFromDateFilterOption } from "src/shared/filter/date-filter-utils";

interface Props {
	value: DateFilterOption;
	dateFormat?: DateFormat;
	dateFormatSeparator?: DateFormatSeparator;
	condition?: DateFilterCondition;
	dateTime?: string | null;
	endDateTime?: string | null;
	onChange: (value: DateFilterOption) => void;
	onDateChange?: (data: { dateTime?: string | null; endDateTime?: string | null; option: DateFilterOption }) => void;
}

export default function DateFilterSelect({ value, condition, dateTime, endDateTime, onDateChange, dateFormat = DateFormat.YYYY_MM_DD, dateFormatSeparator = DateFormatSeparator.HYPHEN }: Props) {
	const isRange = condition === DateFilterCondition.IS_BETWEEN;
	const isYear = condition === DateFilterCondition.IS_IN_YEAR;
	const relativeDate = !isRange && !isYear ? getDateFromDateFilterOption(value) : null;
	const displayedDate = relativeDate
		? `${String(relativeDate.getFullYear()).padStart(4, "0")}-${String(relativeDate.getMonth() + 1).padStart(2, "0")}-${String(relativeDate.getDate()).padStart(2, "0")}`
		: dateTime?.slice(0, 10) ?? "";
	const legacyHint = relativeDate
		? `Saved relative filter: ${getDisplayNameForDateFilterOption(value)}. It remains relative until you choose a date.`
		: undefined;

	return (
		<div className="dataloom-date-filter-input">
			{isYear ? <input type="number" aria-label="Filter year" className="dataloom-input dataloom-focusable"
				value={dateTime ?? ""} min={1} max={9999} step={1} placeholder="2024"
				onChange={e => onDateChange?.({ dateTime: e.target.value || null, option: DateFilterOption.UNSELECTED })} /> :
				<FormattedDatePicker value={displayedDate} ariaLabel={isRange ? "Start date" : "Filter date"}
					dateFormat={dateFormat} dateFormatSeparator={dateFormatSeparator} title={legacyHint}
					max={isRange ? endDateTime?.slice(0, 10) ?? undefined : undefined}
					onChange={value => onDateChange?.({ dateTime: value || null, option: DateFilterOption.UNSELECTED })} />}
			{isRange && <FormattedDatePicker value={endDateTime?.slice(0, 10) ?? ""} ariaLabel="End date"
				dateFormat={dateFormat} dateFormatSeparator={dateFormatSeparator} min={dateTime?.slice(0, 10) ?? undefined}
				onChange={value => onDateChange?.({ endDateTime: value || null, option: DateFilterOption.UNSELECTED })} />}
		</div>
	);
}
