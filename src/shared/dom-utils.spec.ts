/** @jest-environment jsdom */
import { createElement, setStyle } from "./dom-utils";

beforeAll(() => {
 (globalThis as Record<string, unknown>).activeDocument = document;
 (document as unknown as Record<string, unknown>).createEl = (tag: string) => document.createElement(tag);
});

it.each(["div", "a"] as const)("creates %s through the shared element helper", tag => {
 expect(createElement(tag).tagName).toBe(tag.toUpperCase());
});
it("applies inline styles via setStyle", () => {
 const div = createElement("div");
 setStyle(div, "width", "100%");
 expect(div.style.width).toBe("100%");
});
