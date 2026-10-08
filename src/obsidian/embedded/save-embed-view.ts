import { App, EmbedCache, MarkdownView, Notice, WorkspaceLeaf } from "obsidian";
import { EditorView } from "@codemirror/view";
import { LoomViewState } from "src/shared/loom-state/view-state";
import { generateUuid } from "src/shared/uuid";
import { getEmbeddedLoomLinkEls } from "./embed-utils";
import { readEmbedView, replaceEmbedAt, replaceEmbedDestination, writeEmbedView } from "./embed-view-state";

/** Bind a writer to this occurrence, not just to the target loom's path. */
export function createEmbedViewWriter(app: App, leaf: WorkspaceLeaf, linkEl: HTMLElement, mode: "source" | "preview") {
	const view = leaf.view as MarkdownView;
	const hostFile = view.file;
	let source = linkEl.getAttribute("src") ?? "";
	const initialView = readEmbedView(source);
	const id = initialView?.id ?? generateUuid();
	const siblings = getEmbeddedLoomLinkEls(view, mode).filter(el => el.getAttribute("src") === source);
	const ordinal = siblings.indexOf(linkEl);
	const references = hostFile ? app.metadataCache.getFileCache(hostFile)?.embeds ?? [] : [];
	let reference: EmbedCache | undefined = references.filter(item => item.link === source)[ordinal];
	// Live Preview virtualizes its DOM: DOM order alone cannot identify duplicates.
	if (mode === "source") {
		const cm = (view.editor as unknown as { cm?: EditorView } | undefined)?.cm;
		try {
			const offset = cm?.posAtDOM(linkEl);
			if (offset !== undefined) reference = references.find(item =>
				item.link === source && item.position.start.offset <= offset && item.position.end.offset >= offset
			);
			else if (references.filter(item => item.link === source).length > 1) reference = undefined;
		} catch {
			reference = undefined;
		}
	}
	let original = reference?.original;
	let offset = reference?.position.start.offset;
	let pending = Promise.resolve();
	let focusedElement: HTMLElement | null = null;
	function restoreFocus() {
		if (focusedElement?.isConnected && focusedElement.ownerDocument.activeElement === focusedElement.ownerDocument.body) {
			focusedElement.focus({ preventScroll: true });
		}
	}

	return {
		id,
		get source() { return source; },
		rebind(element: HTMLElement) {
			linkEl = element;
			source = element.getAttribute("src") ?? source;
			restoreFocus();
		},
		initialView,
		save(settings: LoomViewState) {
			pending = pending.then(async () => {
				if (!hostFile || leaf.view !== view || view.file !== hostFile) throw new Error("The embed's note is no longer open.");
				// Cache offsets may have moved due to other note edits.
				const current = app.metadataCache.getFileCache(hostFile)?.embeds?.filter(item => item.link === source);
				if (current?.length === 1) {
					original = current[0].original;
					offset = current[0].position.start.offset;
				}
				if (original === undefined || offset === undefined) throw new Error("Cannot locate this embed in the note yet. Try again after the note finishes rendering.");
				const nextSource = writeEmbedView(source, id, settings);
				const replacement = replaceEmbedDestination(original, source, nextSource);
				const oldOriginal = original;
				const oldOffset = offset;
				const oldSource = source;
				const activeElement = linkEl.ownerDocument.activeElement;
				focusedElement = activeElement instanceof HTMLElement && linkEl.contains(activeElement) ? activeElement : null;
				// The editor may synchronously render the new link. Let it reuse our root.
				source = nextSource;
				original = replacement;
				try {
					if (view.getMode() === "source" && view.editor) {
						const editor = view.editor;
						replaceEmbedAt(editor.getValue(), oldOffset, oldOriginal, replacement);
						editor.replaceRange(replacement, editor.offsetToPos(oldOffset), editor.offsetToPos(oldOffset + oldOriginal.length));
					} else {
						await app.vault.process(hostFile, content => replaceEmbedAt(content, oldOffset, oldOriginal, replacement));
					}
				} catch (error) {
					source = oldSource;
					original = oldOriginal;
					throw error;
				}
				linkEl.setAttribute("src", source);
				restoreFocus();
			}).catch((error: unknown) => {
				console.error("DataLoom: could not save embed view", error);
				new Notice(`DataLoom: ${error instanceof Error ? error.message : "Could not save embed settings."}`);
			});
			return pending;
		},
	};
}
