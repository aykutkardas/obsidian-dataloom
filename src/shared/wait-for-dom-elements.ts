/**
 * Waits until elements matching `selector` exist inside `root`, then
 * calls `onReady`.
 *
 * Obsidian's reading view DOM is built asynchronously, and the time it
 * takes grows with vault/plugin size. A fixed timeout is a magic number
 * that fires too early on heavier setups and silently finds no elements
 * (legacy #10 Bug 2). A MutationObserver reacts to the actual render
 * instead of guessing.
 *
 * The observer disconnects itself once the elements appear or after
 * `maxWaitMs` as a safety net. Returns a cleanup function that also
 * stops waiting (used when a newer layout pass supersedes this one).
 */
export const waitForDomElements = (
	root: ParentNode,
	selector: string,
	onReady: (els: Element[]) => void,
	options?: { maxWaitMs?: number }
): (() => void) => {
	const { maxWaitMs = 5000 } = options ?? {};

	const query = () => Array.from(root.querySelectorAll(selector));

	const existing = query();
	if (existing.length > 0) {
		onReady(existing);
		return () => {};
	}

	let settled = false;
	const observer = new MutationObserver(() => {
		const els = query();
		if (els.length > 0) {
			cleanup();
			onReady(els);
		}
	});
	observer.observe(root, { childList: true, subtree: true });

	const timeout = window.setTimeout(cleanup, maxWaitMs);

	function cleanup() {
		if (settled) return;
		settled = true;
		observer.disconnect();
		window.clearTimeout(timeout);
	}

	return cleanup;
};
