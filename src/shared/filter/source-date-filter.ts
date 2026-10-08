import { doesDateMatchFilter } from "./filter-match";
import { DateFilterOption, FilterCondition } from "../loom-state/types/loom-state";

/** Source filterText stores either a legacy relative option or a calendar date. */
export const doesSourceDateMatchFilter = (value: string, condition: FilterCondition, filterText: string): boolean => {
	const isRelative = Object.values(DateFilterOption).includes(filterText as DateFilterOption);
	return doesDateMatchFilter(value, condition,
		isRelative ? filterText as DateFilterOption : DateFilterOption.UNSELECTED,
		isRelative ? null : filterText || null, false);
};
