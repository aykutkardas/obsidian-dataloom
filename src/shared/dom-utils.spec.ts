/** @jest-environment jsdom */
import { createDiv, setStyle } from "./dom-utils";

//Obsidian provides `createEl` and `addClass`/`setText` at runtime; the
//unit tests run in jsdom, so stub the globals Obsidian injects.
beforeAll(() => {
	(globalThis as Record<string, unknown>).activeDocument = document;
	(document as unknown as Record<string, unknown>).createEl = (tag: string) =>
		document.createElement(tag);
	(HTMLElement.prototype as unknown as Record<string, unknown>).addClass =
		function (this: HTMLElement, cls: string) {
			this.classList.add(cls);
		};
	(HTMLElement.prototype as unknown as Record<string, unknown>).setText =
		function (this: HTMLElement, text: string) {
			this.textContent = text;
		};
});

describe("createDiv", () => {
	it("creates a div via the Obsidian createEl helper", () => {
		const div = createDiv();
		expect(div.tagName).toBe("DIV");
		expect(div).toBeInstanceOf(HTMLElement);
	});

	it("applies a class when provided", () => {
		const div = createDiv({ cls: "dataloom-embedded-container" });
		expect(div.classList.contains("dataloom-embedded-container")).toBe(
			true
		);
	});

	it("applies inline styles via setStyle", () => {
		const div = createDiv();
		setStyle(div, "width", "100%");
		expect(div.style.width).toBe("100%");
	});
});
