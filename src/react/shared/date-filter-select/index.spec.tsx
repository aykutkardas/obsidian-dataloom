/** @jest-environment jsdom */
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import { Simulate } from "react-dom/test-utils";
import DateFilterSelect from "./index";
import { DateFilterCondition, DateFilterOption, DateFormat, DateFormatSeparator } from "src/shared/loom-state/types/loom-state";

jest.mock("../select/styles.css", () => ({}));
jest.mock("./styles.css", () => ({}));
jest.mock("../formatted-date-picker/styles.css", () => ({}));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
	(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
	container = document.createElement("div");
	root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); });

it.each([DateFilterOption.UNSELECTED, DateFilterOption.TODAY, DateFilterOption.TOMORROW])("never renders the old dropdown for %s", value => {
	const onDateChange = jest.fn();
	const onChange = jest.fn();
	act(() => root.render(<DateFilterSelect value={value} condition={DateFilterCondition.IS_BEFORE}
		onChange={onChange} onDateChange={onDateChange} />));
	expect(container.querySelector("select")).toBeNull();
	expect(container.querySelectorAll('input[type="date"]')).toHaveLength(1);
	expect(onDateChange).not.toHaveBeenCalled();
	expect(onChange).not.toHaveBeenCalled();
});

it.each(Object.values(DateFilterOption).filter(option => option !== DateFilterOption.UNSELECTED))("leaves a saved %s filter relative until explicitly edited", value => {
	const onDateChange = jest.fn();
	act(() => root.render(<DateFilterSelect value={value} condition={DateFilterCondition.IS}
		onChange={jest.fn()} onDateChange={onDateChange} />));
	const input = container.querySelector("input") as HTMLInputElement;
	expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	expect(input.title).toContain("Saved relative filter:");
	expect(onDateChange).not.toHaveBeenCalled();
	act(() => Simulate.change(input, { target: { value: "2025-01-01" } } as never));
	expect(onDateChange).toHaveBeenCalledWith({ dateTime: "2025-01-01", option: DateFilterOption.UNSELECTED });
});

it("allows picking an absolute date in source filters without a dropdown", () => {
	const onDateChange = jest.fn();
	act(() => root.render(<DateFilterSelect value={DateFilterOption.UNSELECTED}
		onChange={jest.fn()} onDateChange={onDateChange} />));
	expect(container.querySelector("select")).toBeNull();
	const input = container.querySelector("input") as HTMLInputElement;
	act(() => Simulate.change(input, { target: { value: "2024-03-12" } } as never));
	expect(onDateChange).toHaveBeenCalledWith({ dateTime: "2024-03-12", option: DateFilterOption.UNSELECTED });
});

it("keeps the same control structure when a legacy filter becomes an absolute date", () => {
	const onDateChange = jest.fn();
	act(() => root.render(<DateFilterSelect value={DateFilterOption.TODAY} condition={DateFilterCondition.IS}
		onChange={jest.fn()} onDateChange={onDateChange} />));
	const before = container.querySelector('input[type="date"]');
	expect(before).not.toBeNull();
	act(() => root.render(<DateFilterSelect value={DateFilterOption.UNSELECTED} condition={DateFilterCondition.IS}
		dateTime="2025-01-01" onChange={jest.fn()} onDateChange={onDateChange} />));
	expect(container.querySelector('input[type="date"]')).toBe(before);
	expect(container.querySelectorAll('input[type="text"]')).toHaveLength(1);
});

it("clears an absolute date without retaining a relative option", () => {
	const onDateChange = jest.fn();
	act(() => root.render(<DateFilterSelect value={DateFilterOption.UNSELECTED}
		condition={DateFilterCondition.IS} dateTime="2024-03-12" onChange={jest.fn()} onDateChange={onDateChange} />));
	const input = container.querySelector("input") as HTMLInputElement;
	act(() => Simulate.change(input, { target: { value: "" } } as never));
	expect(onDateChange).toHaveBeenCalledWith({ dateTime: null, option: DateFilterOption.UNSELECTED });
});

it("applies the column format to both range dates", () => {
 act(() => root.render(<DateFilterSelect value={DateFilterOption.UNSELECTED}
 condition={DateFilterCondition.IS_BETWEEN} dateTime="2024-03-12" endDateTime="2024-12-31"
 dateFormat={DateFormat.DD_MM_YYYY} dateFormatSeparator={DateFormatSeparator.DOT} onChange={jest.fn()} />));
 const texts = container.querySelectorAll('input[type="text"]');
 expect((texts[0] as HTMLInputElement).value).toBe("12.03.2024");
 expect((texts[1] as HTMLInputElement).value).toBe("31.12.2024");
});

it("offers a year-only input", () => {
	const onDateChange = jest.fn();
	act(() => root.render(<DateFilterSelect value={DateFilterOption.UNSELECTED}
		condition={DateFilterCondition.IS_IN_YEAR} dateTime="2024"
		onChange={jest.fn()} onDateChange={onDateChange} />));
	const input = container.querySelector('input[type="number"]') as HTMLInputElement;
	expect(input).not.toBeNull();
	expect(input.value).toBe("2024");
	act(() => Simulate.change(input, { target: { value: "2025" } } as never));
	expect(onDateChange).toHaveBeenCalledWith({ dateTime: "2025", option: DateFilterOption.UNSELECTED });
	expect(container.querySelector("select")).toBeNull();
});

it("offers two date pickers for a range", () => {
	const onDateChange = jest.fn();
	act(() => root.render(<DateFilterSelect value={DateFilterOption.UNSELECTED}
		condition={DateFilterCondition.IS_BETWEEN} dateTime="2024-01-01" endDateTime="2024-12-31"
		onChange={jest.fn()} onDateChange={onDateChange} />));
	const inputs = container.querySelectorAll('input[type="date"]');
	expect(inputs).toHaveLength(2);
	expect((inputs[1] as HTMLInputElement).value).toBe("2024-12-31");
	act(() => Simulate.change(inputs[1], { target: { value: "2025-12-31" } } as never));
	expect(onDateChange).toHaveBeenCalledWith({ endDateTime: "2025-12-31", option: DateFilterOption.UNSELECTED });
	expect(container.querySelector("select")).toBeNull();
});

it("offers a date picker for an absolute before filter", () => {
	const onDateChange = jest.fn();
	act(() => root.render(<DateFilterSelect value={DateFilterOption.UNSELECTED}
		condition={DateFilterCondition.IS_BEFORE} dateTime="2024-03-12"
		onChange={jest.fn()} onDateChange={onDateChange} />));
	const input = container.querySelector('input[type="date"]') as HTMLInputElement;
	expect(input).not.toBeNull();
	expect(input.value).toBe("2024-03-12");
	act(() => Simulate.change(input, { target: { value: "2025-01-01" } } as never));
	expect(onDateChange).toHaveBeenCalledWith({ dateTime: "2025-01-01", option: DateFilterOption.UNSELECTED });
});
