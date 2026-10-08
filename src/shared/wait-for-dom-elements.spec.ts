/** @jest-environment jsdom */
import { waitForDomElements } from "./wait-for-dom-elements";


const appendTarget = (root: HTMLElement) => {
	const el = document.createElement("span");
	el.classList.add("target");
	root.appendChild(el);
	return el;
};

describe("waitForDomElements", () => {
	it("uses window timers and clears the observer timeout on cleanup", () => {
		const root = document.createElement("div");
		const setTimer = jest.spyOn(window, "setTimeout");
		const clearTimer = jest.spyOn(window, "clearTimeout");
		try {
			const cleanup = waitForDomElements(root, ".target", jest.fn(), { maxWaitMs: 123 });
			expect(setTimer).toHaveBeenCalledWith(expect.any(Function), 123);
			cleanup();
			expect(clearTimer).toHaveBeenCalledWith(setTimer.mock.results[0].value);
		} finally {
			setTimer.mockRestore();
			clearTimer.mockRestore();
		}
	});
	beforeEach(() => jest.useFakeTimers());
	afterEach(() => jest.useRealTimers());

	it("calls onReady immediately when elements already exist", () => {
		const root = document.createElement("div");
		appendTarget(root);
		const onReady = jest.fn();
		waitForDomElements(root, ".target", onReady);
		expect(onReady).toHaveBeenCalledTimes(1);
		const calls = onReady.mock.calls as unknown as unknown[][];
		const els = calls[0][0] as unknown[];
		expect(els).toHaveLength(1);
	});

	it("calls onReady when elements appear after a delay", async () => {
		const root = document.createElement("div");
		document.body.appendChild(root);
		const onReady = jest.fn();
		waitForDomElements(root, ".target", onReady);
		expect(onReady).not.toHaveBeenCalled();

		//Simulate the reading view DOM being built later than a fixed timeout
		setTimeout(() => {
			appendTarget(root);
		}, 200);
		jest.advanceTimersByTime(200);
		//MutationObserver callbacks are queued as microtasks; flush them
		await Promise.resolve();

		expect(onReady).toHaveBeenCalledTimes(1);
		root.remove();
	});

	it("does not call onReady after the observer is cleaned up", () => {
		const root = document.createElement("div");
		document.body.appendChild(root);
		const onReady = jest.fn();
		const cleanup = waitForDomElements(root, ".target", onReady);
		cleanup();
		appendTarget(root);
		jest.advanceTimersByTime(10000);
		expect(onReady).not.toHaveBeenCalled();
		root.remove();
	});
});
