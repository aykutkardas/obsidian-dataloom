import React from "react";
import "./styles.css";
import { DateFormat, DateFormatSeparator } from "src/shared/loom-state/types/loom-state";
import { getDatePickerValue, getDateStringFromPickerValue } from "src/react/loom-app/date-cell-edit/utils";
import { getDateFormatString } from "src/shared/date/utils";

interface Props {
 value: string;
 dateFormat: DateFormat;
 dateFormatSeparator: DateFormatSeparator;
 ariaLabel: string;
 title?: string;
 min?: string;
 max?: string;
 onChange: (value: string) => void;
}
export default function FormattedDatePicker({ value, dateFormat, dateFormatSeparator, ariaLabel, title, min, max, onChange }: Props) {
 const formatted = value ? getDateStringFromPickerValue(value, dateFormat, dateFormatSeparator) : "";
 const [draft, setDraft] = React.useState(formatted);
 const [invalid, setInvalid] = React.useState(false);
 React.useEffect(() => { setDraft(formatted); setInvalid(false); }, [formatted, dateFormat, dateFormatSeparator]);
 function handleTextChange(text: string) {
  setDraft(text);
  const parsed = text ? getDatePickerValue(text, dateFormat, dateFormatSeparator) : "";
  const valid = text === "" || (parsed !== "" && (!min || parsed >= min) && (!max || parsed <= max));
  setInvalid(!valid);
  if (valid) onChange(parsed);
 }
 return <div className="dataloom-formatted-date-picker">
  <input type="text" aria-label={ariaLabel} title={title} aria-invalid={invalid}
   className="dataloom-input dataloom-focusable" value={draft}
   placeholder={getDateFormatString(dateFormat, dateFormatSeparator)}
   onChange={e => handleTextChange(e.target.value)}
   onKeyDown={e => { if (e.key === "Enter") e.stopPropagation(); }} />
  <span className="dataloom-formatted-date-picker__calendar">
   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>
   <input type="date" aria-label={`${ariaLabel} calendar`} value={value} min={min} max={max}
    onClick={e => { e.currentTarget.showPicker?.(); }} onChange={e => onChange(e.target.value)} />
  </span>
 </div>;
}
