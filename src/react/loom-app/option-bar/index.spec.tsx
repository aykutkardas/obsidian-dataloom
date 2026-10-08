import { vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import OptionBar from ".";
import MenuProvider from "src/react/shared/menu-provider";

vi.mock("./styles.css", () => ({}));
vi.mock("src/react/shared/button/styles.css", () => ({}));
vi.mock("src/react/shared/stack/styles.css", () => ({}));
vi.mock("src/react/shared/icon", () => ({ __esModule: true, default: () => <span /> }));
vi.mock("./search-bar", () => ({ __esModule: true, default: () => null }));
vi.mock("./active-filter-bubble", () => ({ __esModule: true, default: () => null }));
vi.mock("./sort-bubble-list", () => ({ __esModule: true, default: () => null }));
vi.mock("./more-menu", () => ({
	__esModule: true,
	default: ({ isOpen, onSourcesClick, onFilterClick }: {
		isOpen: boolean; onSourcesClick: () => void; onFilterClick: () => void;
	}) => isOpen ? <section data-menu="more">
		<button onClick={onSourcesClick}>Sources</button>
		<button onClick={onFilterClick}>Filter</button>
	</section> : null,
}));
vi.mock("./sources-menu", () => ({
	__esModule: true,
	default: ({ isOpen, position }: { isOpen: boolean; position: { left: number } }) =>
		isOpen ? <section data-menu="sources" data-left={position.left} /> : null,
}));
vi.mock("./filter-menu", () => ({
	__esModule: true,
	default: ({ isOpen, position }: { isOpen: boolean; position: { left: number } }) =>
		isOpen ? <section data-menu="filter" data-left={position.left} /> : null,
}));

const props = {
	columns: [], filters: [], sources: [], showCalculationRow: false,
	onFilterUpdate: vi.fn(), onFilterDeleteClick: vi.fn(),
	onFilterAddClick: vi.fn(), onFilterDisableAll: vi.fn(),
	onCalculationRowToggle: vi.fn(), onSourceAdd: vi.fn(),
	onSourceDelete: vi.fn(), onColumnChange: vi.fn(), onSourceUpdate: vi.fn(),
};

beforeEach(() => {
	(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
	vi.clearAllMocks();
});

it.each(["sources", "filter"])("opens mobile %s from More without a hidden trigger", (name) => {
	Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
	const container = document.createElement("div");
	const root = createRoot(container);
	act(() => root.render(<MenuProvider><OptionBar {...props} /></MenuProvider>));
	const moreTrigger = container.querySelector(".dataloom-menu-trigger")!;
	vi.spyOn(moreTrigger, "getBoundingClientRect").mockReturnValue({
		top: 50, left: 300, width: 30, height: 40, right: 330, bottom: 90, x: 300, y: 50, toJSON: () => ({}),
	});
	act(() => Simulate.click(moreTrigger));
	const button = container.querySelector(`section[data-menu="more"] button${name === "filter" ? ":last-child" : ":first-child"}`)!;
	act(() => Simulate.click(button));
	expect(container.querySelector(`[data-menu="${name}"]`)).not.toBeNull();
	expect(container.querySelector(`[data-menu="${name}"]`)?.getAttribute("data-left")).toBe("300");
	expect(container.querySelector('[data-menu="more"]')).toBeNull();
	if (name === "filter") expect(props.onFilterAddClick).toHaveBeenCalledTimes(1);
	act(() => root.unmount());
});

it.each(["Sources", "Filter"])("keeps the desktop %s trigger working", (name) => {
	Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
	const container = document.createElement("div");
	const root = createRoot(container);
	act(() => root.render(<MenuProvider><OptionBar {...props} /></MenuProvider>));
	const trigger = Array.from(container.querySelectorAll(".dataloom-menu-trigger"))
		.find((el) => el.textContent === name)!;
	act(() => Simulate.click(trigger));
	expect(container.querySelector(`[data-menu="${name.toLowerCase()}"]`)).not.toBeNull();
	act(() => root.unmount());
});
