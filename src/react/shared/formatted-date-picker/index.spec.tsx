/** @jest-environment jsdom */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import FormattedDatePicker from "./index";
import { DateFormat, DateFormatSeparator } from "src/shared/loom-state/types/loom-state";
jest.mock("./styles.css", () => ({}));
it("rejects invalid dates without changing the stored filter", () => {
 const container = document.createElement("div");
 const root = createRoot(container);
 const onChange = jest.fn();
 (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
 act(() => root.render(<FormattedDatePicker value="2024-03-12" dateFormat={DateFormat.DD_MM_YYYY}
 dateFormatSeparator={DateFormatSeparator.DOT} ariaLabel="Pick date" onChange={onChange} />));
 const text = container.querySelector('input[type="text"]') as HTMLInputElement;
 act(() => Simulate.change(text, { target: { value: "31.02.2024" } } as never));
 expect(text.getAttribute("aria-invalid")).toBe("true");
 expect(onChange).not.toHaveBeenCalled();
 act(() => Simulate.change(text, { target: { value: "" } } as never));
 expect(onChange).toHaveBeenCalledWith("");
 act(() => root.render(<FormattedDatePicker value="2024-03-12" dateFormat={DateFormat.YYYY_MM_DD}
 dateFormatSeparator={DateFormatSeparator.SLASH} ariaLabel="Pick date" onChange={onChange} />));
 expect(text.value).toBe("2024/03/12");
 act(() => root.unmount());
});
it.each([
 [DateFormat.DD_MM_YYYY, DateFormatSeparator.DOT, "12.03.2024"],
 [DateFormat.MM_DD_YYYY, DateFormatSeparator.SLASH, "03/12/2024"],
 [DateFormat.YYYY_MM_DD, DateFormatSeparator.HYPHEN, "2024-03-12"],
])("uses the table format %s %s", (dateFormat, dateFormatSeparator, expected) => {
 const container = document.createElement("div");
 const root = createRoot(container);
 const onChange = jest.fn();
 (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
 act(() => root.render(<FormattedDatePicker value="2024-03-12" dateFormat={dateFormat}
 dateFormatSeparator={dateFormatSeparator} ariaLabel="Pick date" onChange={onChange} />));
 const text = container.querySelector('input[type="text"]') as HTMLInputElement;
 expect(text.value).toBe(expected);
 act(() => Simulate.change(text, { target: { value: expected } } as never));
 expect(onChange).toHaveBeenCalledWith("2024-03-12");
 const calendar = container.querySelector('input[type="date"]') as HTMLInputElement;
 act(() => Simulate.change(calendar, { target: { value: "2025-01-01" } } as never));
 expect(onChange).toHaveBeenLastCalledWith("2025-01-01");
 act(() => root.unmount());
});
