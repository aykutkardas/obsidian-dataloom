/** @jest-environment jsdom */
import { createElement, setStyle } from "./dom-utils";

// Obsidian's Node.createEl appends to its receiver, including Document.
const originalCreateEl = Object.getOwnPropertyDescriptor(Node.prototype, "createEl");
beforeAll(() => {
	(globalThis as Record<string, unknown>).activeDocument = document;
	Object.defineProperty(Node.prototype, "createEl", {
		configurable: true,
		value: function (this: Node, tag: string) {
			const owner = this.nodeType === Node.DOCUMENT_NODE
				? this as Document
				: this.ownerDocument!;
			const element = owner.createElement(tag);
			this.appendChild(element);
			return element;
		},
	});
});
afterAll(() => {
	if (originalCreateEl) Object.defineProperty(Node.prototype, "createEl", originalCreateEl);
	else delete (Node.prototype as unknown as Record<string, unknown>).createEl;
	delete (globalThis as Record<string, unknown>).activeDocument;
});

it.each(["div", "a"] as const)("creates %s without appending to Document", tag => {
	const children = Array.from(document.childNodes);
	const element = createElement(tag);
	expect(element.tagName).toBe(tag.toUpperCase());
	expect(element.ownerDocument).toBe(document);
	expect(element.isConnected).toBe(false);
	expect(Array.from(document.childNodes)).toEqual(children);
});

it("uses the active pop-out document", () => {
	const popout = document.implementation.createHTMLDocument("Pop-out");
	(globalThis as Record<string, unknown>).activeDocument = popout;
	try {
		expect(createElement("div").ownerDocument).toBe(popout);
	} finally {
		(globalThis as Record<string, unknown>).activeDocument = document;
	}
});

it("applies inline styles via setStyle", () => {
	const div = createElement("div");
	setStyle(div, "width", "100%");
	expect(div.style.width).toBe("100%");
});
