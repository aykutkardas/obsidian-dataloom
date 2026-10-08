/** @jest-environment jsdom */
import { hasLoadedEmbeddedLoom } from "./embed-utils";

describe("hasLoadedEmbeddedLoom", () => {
	it("returns true when the container has rendered content", () => {
		const linkEl = document.createElement("div");
		const container = document.createElement("div");
		container.classList.add("dataloom-embedded-container");
		container.appendChild(document.createElement("div"));
		linkEl.appendChild(container);
		expect(hasLoadedEmbeddedLoom(linkEl)).toBe(true);
	});

	it("returns false when the container is empty after unmount", () => {
		//purgeEmbeddedLoomApps unmounts the React root but leaves the
		//container div in place. An empty container is not a loaded loom —
		//treating it as loaded leaves the embed permanently blank when the
		//user switches Live Preview → Reading → Live Preview (legacy #10 Bug 3).
		const linkEl = document.createElement("div");
		const container = document.createElement("div");
		container.classList.add("dataloom-embedded-container");
		linkEl.appendChild(container);
		expect(hasLoadedEmbeddedLoom(linkEl)).toBe(false);
	});

	it("returns false with no container", () => {
		const linkEl = document.createElement("div");
		expect(hasLoadedEmbeddedLoom(linkEl)).toBe(false);
	});
});
