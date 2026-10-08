import React, { act } from "react";
import { App, WorkspaceLeaf } from "obsidian";
import { loadEmbeddedLoomApps, unmountAllEmbeddedApps } from "./embedded-app-manager";
import { createLoomState } from "src/shared/loom-state/loom-state-factory";
import { LoomViewState } from "src/shared/loom-state/view-state";
import { SortDir } from "src/shared/loom-state/types/loom-state";

const probe = vi.hoisted(() => ({ mounted: vi.fn(), unmounted: vi.fn(), save: undefined as undefined | ((view: LoomViewState) => void) }));
vi.mock("src/redux/store", () => ({ store: { getState: () => ({ global: { settings: { defaultEmbedWidth: "100%", defaultEmbedHeight: "300px" } } }) } }));
vi.mock("src/react/loom-app", () => ({ default: function MockApp({ onSaveViewState }: { onSaveViewState: (view: LoomViewState) => void }) {
	probe.save = onSaveViewState;
	React.useEffect(() => { probe.mounted(); return () => { probe.unmounted(); }; }, []);
	return <input defaultValue="An open filter editor" />;
} }));

beforeEach(() => {
	(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
	vi.clearAllMocks();
	Object.defineProperty(HTMLElement.prototype, "createDiv", { configurable: true, value: function (this: HTMLElement, options: { cls: string }) {
		const div = document.createElement("div");
		div.className = options.cls;
		this.appendChild(div);
		return div;
	} });
	Object.defineProperty(HTMLElement.prototype, "empty", { configurable: true, value: function (this: HTMLElement) { this.replaceChildren(); } });
});
afterEach(() => {
	act(() => unmountAllEmbeddedApps());
	document.body.replaceChildren();
	Reflect.deleteProperty(HTMLElement.prototype, "createDiv");
	Reflect.deleteProperty(HTMLElement.prototype, "empty");
});

it("reuses the running app and restores filter focus when saving preferences replaces the Markdown embed", async () => {
	const state = createLoomState(1, 0, { pluginVersion: "8.16.20" });
	const contentEl = document.createElement("div");
	const surface = document.createElement("div");
	surface.className = "markdown-reading-view";
	contentEl.appendChild(surface);
	document.body.appendChild(contentEl);
	const makeLink = (source: string) => {
		const link = document.createElement("div");
		link.className = "internal-embed";
		link.setAttribute("src", source);
		return link;
	};
	let link = makeLink("tasks.loom");
	surface.appendChild(link);
	let markdown = "![[tasks.loom]]";
	const file = { path: "project.md" };
	const leaf = { view: { file, contentEl, getMode: () => "preview" } } as unknown as WorkspaceLeaf;
	const app = {
		metadataCache: {
			getFirstLinkpathDest: (path: string) => ({ path }),
			getFileCache: () => ({ embeds: [{ link: "tasks.loom", original: markdown, position: { start: { offset: 0 } } }] }),
		},
		vault: {
			read: vi.fn().mockResolvedValue(JSON.stringify(state)),
			process: vi.fn((_file: unknown, update: (text: string) => string) => {
				markdown = update(markdown);
				const next = makeLink(markdown.slice(3, -2));
				link.replaceWith(next);
				link = next;
				loadEmbeddedLoomApps(app as unknown as App, "8.16.20", leaf, "preview");
				return Promise.resolve(markdown);
			}),
		},
	};
	await act(async () => {
		loadEmbeddedLoomApps(app as unknown as App, "8.16.20", leaf, "preview");
		await Promise.resolve();
	});
	const input = contentEl.querySelector("input")!;
	input.focus();
	await act(async () => {
		probe.save?.({ filters: [], sorts: [{ columnId: state.model.columns[0].id, direction: SortDir.DESC }] });
		await Promise.resolve();
		await Promise.resolve();
	});
	expect(probe.mounted).toHaveBeenCalledTimes(1);
	expect(probe.unmounted).toHaveBeenCalledTimes(0);
	expect(contentEl.querySelector("input")).toBe(input);
	expect(document.activeElement).toBe(input);
	expect(app.vault.read).toHaveBeenCalledTimes(1);
	// A different loom with a copied view fragment must get its own table app.
	await act(async () => {
		const other = makeLink(link.getAttribute("src")!.replace("tasks.loom", "other.loom"));
		link.replaceWith(other);
		link = other;
		loadEmbeddedLoomApps(app as unknown as App, "8.16.20", leaf, "preview");
		await Promise.resolve();
	});
	expect(probe.unmounted).toHaveBeenCalledTimes(1);
	expect(probe.mounted).toHaveBeenCalledTimes(2);
	expect(app.vault.read).toHaveBeenCalledTimes(2);
});
