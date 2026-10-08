import { App, EmbedCache, Notice, WorkspaceLeaf } from "obsidian";
import { createEmbedViewWriter } from "./save-embed-view";
import { readEmbedView } from "./embed-view-state";
import { SortDir } from "src/shared/loom-state/types/loom-state";

vi.mock("obsidian", () => ({ Notice: vi.fn() }));

const settings = { filters: [], sorts: [{ columnId: "title", direction: SortDir.ASC }] };

function setup(mode: "source" | "preview", duplicate = false) {
	const token = "![[tasks.loom|600x400]]";
	let content = `# Tasks\n${token}${duplicate ? `\n${token}` : ""}`;
	const initialContent = content;
	const hostFile = { path: "project.md" };
	const elements = document.createElement("div");
	const surface = document.createElement("div");
	surface.className = mode === "source" ? "markdown-source-view" : "markdown-reading-view";
	elements.appendChild(surface);
	const links = Array.from({ length: duplicate ? 2 : 1 }, () => {
		const link = document.createElement("div");
		link.className = "internal-embed";
		link.setAttribute("src", "tasks.loom");
		surface.appendChild(link);
		return link;
	});
	const references = links.map((_, index) => ({
		link: "tasks.loom", original: token,
		position: { start: { offset: index === 0 ? content.indexOf(token) : content.lastIndexOf(token) },
			end: { offset: (index === 0 ? content.indexOf(token) : content.lastIndexOf(token)) + token.length } },
	})) as EmbedCache[];
	const editor = {
		cm: { posAtDOM: vi.fn((element: HTMLElement) => references[links.findIndex(link => link === element)].position.start.offset) },
		getValue: () => content,
		offsetToPos: (offset: number) => ({ line: 0, ch: offset }),
		replaceRange: vi.fn((replacement: string, from: { ch: number }, to: { ch: number }) => {
			content = content.slice(0, from.ch) + replacement + content.slice(to.ch);
		}),
	};
	const view = { file: hostFile, contentEl: elements, editor, getMode: () => mode };
	const app = {
		metadataCache: { getFileCache: vi.fn(() => ({ embeds: references })) },
		vault: { process: vi.fn(async (file: unknown, update: (text: string) => string) => {
			expect(file).toBe(hostFile);
			content = update(content);
		}) },
	};
	return {
		app: app as unknown as App, leaf: { view } as unknown as WorkspaceLeaf,
		links, editor, initialContent,
		getContent: () => content, setContent: (value: string) => { content = value; },
		process: app.vault.process,
	};
}

beforeEach(() => vi.clearAllMocks());

it.each(["source", "preview"] as const)("saves only the second occurrence in %s mode", async mode => {
	const fixture = setup(mode, true);
	const writer = createEmbedViewWriter(fixture.app, fixture.leaf, fixture.links[1], mode);
	await writer.save(settings);
	const lines = fixture.getContent().split("\n");
	expect(lines[1]).toBe("![[tasks.loom|600x400]]");
	expect(lines[2]).toBe(`![[${writer.source}|600x400]]`);
	expect(readEmbedView(writer.source)?.sorts).toEqual(settings.sorts);
	expect(Notice).toHaveBeenCalledTimes(0);
	expect(fixture.process).toHaveBeenCalledTimes(mode === "preview" ? 1 : 0);
	expect(fixture.editor.replaceRange).toHaveBeenCalledTimes(mode === "source" ? 1 : 0);
});

it("queues successive updates even before Obsidian's metadata cache catches up", async () => {
	const fixture = setup("preview");
	const writer = createEmbedViewWriter(fixture.app, fixture.leaf, fixture.links[0], "preview");
	await Promise.all([writer.save(settings), writer.save({ filters: [], sorts: [] })]);
	expect(fixture.getContent()).toBe(`# Tasks\n![[${writer.source}|600x400]]`);
	expect(readEmbedView(writer.source)?.sorts).toEqual([]);
	expect(Notice).toHaveBeenCalledTimes(0);
});

it("refuses stale metadata without overwriting unsaved editor content", async () => {
	const fixture = setup("source");
	const writer = createEmbedViewWriter(fixture.app, fixture.leaf, fixture.links[0], "source");
	const edited = `New unsaved paragraph\n${fixture.initialContent}`;
	fixture.setContent(edited);
	const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
	await writer.save(settings);
	expect(fixture.getContent()).toBe(edited);
	expect(fixture.editor.replaceRange).toHaveBeenCalledTimes(0);
	expect(Notice).toHaveBeenCalledTimes(1);
	error.mockRestore();
});

it("uses the CodeMirror position for a virtualized duplicate rather than DOM ordinal", async () => {
	const fixture = setup("source", true);
	fixture.links[0].remove();
	const writer = createEmbedViewWriter(fixture.app, fixture.leaf, fixture.links[1], "source");
	await writer.save(settings);
	expect(fixture.getContent().split("\n")[1]).toBe("![[tasks.loom|600x400]]");
	expect(fixture.getContent().split("\n")[2]).toBe(`![[${writer.source}|600x400]]`);
});

it("keeps view identities independent for two occurrences of the same loom", () => {
	const fixture = setup("preview", true);
	const first = createEmbedViewWriter(fixture.app, fixture.leaf, fixture.links[0], "preview");
	const second = createEmbedViewWriter(fixture.app, fixture.leaf, fixture.links[1], "preview");
	expect(first.id === second.id).toBe(false);
});
