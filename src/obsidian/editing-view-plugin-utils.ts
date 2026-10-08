import { App, MarkdownView, WorkspaceLeaf } from "obsidian";
import { EditorView } from "@codemirror/view";

/**
 * Finds the markdown leaf whose underlying CodeMirror view matches the
 * view from a ViewUpdate.
 *
 * A leaf's editor is not ready immediately after the leaf is created
 * (common when several tabs or panes are open). In that case `.editor`
 * is undefined, so we must guard before reading `.cm` — otherwise a
 * TypeError aborts the update and the embedded loom never renders
 * (legacy #10 Bug 1).
 */
export const findActiveLeafForUpdate = (
	app: App,
	update: { view: EditorView }
): WorkspaceLeaf | undefined => {
	const markdownLeaves = app.workspace.getLeavesOfType("markdown");
	return markdownLeaves.find((leaf) => {
		const editor = (leaf.view as MarkdownView).editor as unknown as
			| { cm: EditorView }
			| undefined;
		if (!editor) return false;
		return editor.cm === update.view;
	});
};
