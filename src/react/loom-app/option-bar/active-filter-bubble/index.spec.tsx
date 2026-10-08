/** @jest-environment jsdom */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import ActiveFilterBubble from "./index";

jest.mock("src/react/shared/bubble/styles.css", () => ({}));
jest.mock("src/react/shared/stack/styles.css", () => ({}));
jest.mock("src/react/shared/button/styles.css", () => ({}));
jest.mock("src/react/shared/icon", () => ({ __esModule: true, default: () => <span data-icon="true" /> }));

it("offers an accessible close button for active filters", () => {
 (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
 const container = document.createElement("div");
 const root = createRoot(container);
 const onDisable = jest.fn();
 act(() => root.render(<ActiveFilterBubble numActive={2} onDisableClick={onDisable} />));
 expect(container.textContent).toContain("2 active filters");
 const close = container.querySelector('button[aria-label="Disable all filters"]');
 expect(close).not.toBeNull();
 act(() => Simulate.click(close!));
 expect(onDisable).toHaveBeenCalledTimes(1);
 act(() => root.render(<ActiveFilterBubble numActive={0} onDisableClick={onDisable} />));
 expect(container.querySelector(".dataloom-bubble")).toBeNull();
 act(() => root.unmount());
});
