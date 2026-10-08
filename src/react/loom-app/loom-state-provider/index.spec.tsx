import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { App, TFile, WorkspaceLeaf } from "obsidian";
import LoomStateProvider, { useLoomState } from "./index";
import AppMountProvider from "../app-mount-provider";
import { createLoomState, createTextFilter } from "src/shared/loom-state/loom-state-factory";
import { LoomState, SortDir, TextCell } from "src/shared/loom-state/types/loom-state";
import ColumnUpdateCommand from "src/shared/loom-state/commands/column-update-command";
import FilterAddCommand from "src/shared/loom-state/commands/filter-add-command";
import EventManager from "src/shared/event/event-manager";
import { LoomViewState } from "src/shared/loom-state/view-state";

const file = Object.assign(new TFile(), { path: "tasks.loom" });
const roots: Root[] = [];
let contexts: Record<string, ReturnType<typeof useLoomState>>;

function Probe({ id }: { id: string }) {
	contexts[id] = useLoomState();
	return null;
}

function mount(id: string, state: LoomState, initialViewState?: LoomViewState, app = {} as App) {
	const onSave = vi.fn((sourceId: string, shared: LoomState) => {
		EventManager.getInstance().emit("app-refresh-by-state", file.path, sourceId, shared);
	});
	const onSaveView = vi.fn();
	const root = createRoot(document.createElement("div"));
	roots.push(root);
	act(() => root.render(
		<AppMountProvider app={app} mountLeaf={{} as WorkspaceLeaf} reactAppId={id} loomFile={file} isMarkdownView={!!initialViewState}>
			<LoomStateProvider initialState={state} initialViewState={initialViewState} onSaveState={onSave} onSaveViewState={onSaveView}>
				<Probe id={id} />
			</LoomStateProvider>
		</AppMountProvider>
	));
	return { onSave, onSaveView };
}

beforeEach(() => {
	(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
	contexts = {};
});
afterEach(() => { act(() => roots.splice(0).forEach(root => root.unmount())); });

it("keeps two tabs independent and supports local undo/redo without saving table data", () => {
	const state = createLoomState(1, 2, { pluginVersion: "8.16.20" });
	const columnId = state.model.columns[0].id;
	(state.model.rows[0].cells[0] as TextCell).content = "Zulu";
	(state.model.rows[1].cells[0] as TextCell).content = "Alpha";
	const first = mount("first", state);
	const second = mount("second", state);
	act(() => contexts.first.doCommand(new ColumnUpdateCommand(columnId, { sortDir: SortDir.ASC }, { shouldSortRows: true })));
	act(() => contexts.first.doCommand(new FilterAddCommand()));
	expect(contexts.first.loomState.model.filters).toHaveLength(1);
	expect(contexts.second.loomState.model.filters).toHaveLength(0);
	expect(contexts.second.loomState.model.columns[0].sortDir).toBe(SortDir.NONE);
	expect(first.onSave).toHaveBeenCalledTimes(0);
	expect(second.onSave).toHaveBeenCalledTimes(0);
	act(() => contexts.first.onUndo());
	expect(contexts.first.loomState.model.filters).toHaveLength(0);
	act(() => contexts.first.onUndo());
	expect(contexts.first.loomState.model.rows.map(row => row.id)).toEqual(state.model.rows.map(row => row.id));
	act(() => contexts.first.onRedo());
	expect(contexts.first.loomState.model.columns[0].sortDir).toBe(SortDir.ASC);
	expect(first.onSave).toHaveBeenCalledTimes(0);
});

it("syncs shared edits without leaking the editing view's filters or sort", () => {
	const state = createLoomState(1, 2);
	const columnId = state.model.columns[0].id;
	const local = { filters: [createTextFilter(columnId)], sorts: [{ columnId, direction: SortDir.DESC }] };
	const embed = mount("embed", state, local);
	mount("tab", state);
	act(() => contexts.embed.doCommand(new ColumnUpdateCommand(columnId, { content: "Renamed" })));
	expect(embed.onSave).toHaveBeenCalledTimes(1);
	expect(contexts.tab.loomState.model.columns[0].content).toBe("Renamed");
	expect(contexts.tab.loomState.model.columns[0].sortDir).toBe(SortDir.NONE);
	expect(contexts.tab.loomState.model.filters).toHaveLength(0);
	expect(contexts.embed.loomState.model.filters).toEqual(local.filters);
	act(() => contexts.tab.doCommand(new ColumnUpdateCommand(columnId, { content: "Renamed again" })));
	expect(contexts.embed.loomState.model.columns[0].content).toBe("Renamed again");
	expect(contexts.embed.loomState.model.columns[0].sortDir).toBe(SortDir.DESC);
	expect(contexts.embed.loomState.model.filters).toEqual(local.filters);
});

it("restores saved embed settings when reopened and retains them on external file refresh", async () => {
	const state = createLoomState(1, 1, { pluginVersion: "8.16.20" });
	const columnId = state.model.columns[0].id;
	const local = { filters: [], sorts: [{ columnId, direction: SortDir.DESC }] };
	const app = { vault: { read: vi.fn().mockResolvedValue(JSON.stringify(state)) } } as unknown as App;
	mount("embed", state, local, app);
	await act(async () => {
		EventManager.getInstance().emit("app-refresh-by-file", file, "8.16.20");
		await Promise.resolve();
	});
	expect(contexts.embed.loomState.model.columns[0].sortDir).toBe(SortDir.DESC);
	mount("reopened", state, local);
	expect(contexts.reopened.loomState.model.columns[0].sortDir).toBe(SortDir.DESC);
});
