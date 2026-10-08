import { createTextFilter } from "src/shared/loom-state/loom-state-factory";
import { SortDir } from "src/shared/loom-state/types/loom-state";
import { getLoomLinkPath, readEmbedView, replaceEmbedAt, replaceEmbedDestination, writeEmbedView } from "./embed-view-state";

const settings = {
	filters: [{ ...createTextFilter("title"), text: "İşler | # [] % & 日本語" }],
	sorts: [{ columnId: "title", direction: SortDir.DESC }],
};

it("round-trips filters and sorts inside a portable embed destination", () => {
	const src = writeEmbedView("../My Tasks.loom", "unique-id", settings);
	expect(getLoomLinkPath(src)).toBe("../My Tasks.loom");
	expect(readEmbedView(src)).toEqual({ version: 1, id: "unique-id", ...settings });
	expect(src.includes("|")).toBe(false);
	expect(src.includes("]")).toBe(false);
	const changed = writeEmbedView(src, "unique-id", { filters: [], sorts: [] });
	expect(readEmbedView(changed)?.filters).toEqual([]);
	expect(changed.split("#")).toHaveLength(2);
});

it.each(["tasks.loom", "tasks.loom#other", "tasks.loom#dataloom-view=%", "tasks.loom#dataloom-view=%7B%7D",
	`tasks.loom#dataloom-view=${encodeURIComponent(JSON.stringify({ version: 2, id: "x", ...settings }))}`,
	`tasks.loom#dataloom-view=${encodeURIComponent(JSON.stringify({ version: 1, id: "x", filters: [{}], sorts: [] }))}`,
])("ignores missing or invalid settings: %s", src => {
	expect(readEmbedView(src)).toBeUndefined();
});

it.each(["![[tasks.loom]]", "![[tasks.loom|600x400]]", "![[tasks.loom|My tasks]]", "![Tasks](tasks.loom)", "![Tasks](<tasks.loom>)"])("preserves link style and alias: %s", original => {
	const next = writeEmbedView("tasks.loom", "view-id", settings);
	expect(replaceEmbedDestination(original, "tasks.loom", next)).toBe(original.replace("tasks.loom", next));
});

it("preserves encoded paths and Markdown titles", () => {
	const next = writeEmbedView("My Tasks.loom", "view-id", settings);
	expect(replaceEmbedDestination('![Tasks](My%20Tasks.loom "Title")', "My Tasks.loom", next))
		.toBe(`![Tasks](${next.replace(/ /g, "%20")} "Title")`);
});

it("updates only the selected occurrence in a note", () => {
	const original = "![[tasks.loom|400x300]]";
	const note = `# First\n${original}\n# Second\n${original}`;
	const replacement = replaceEmbedDestination(original, "tasks.loom", writeEmbedView("tasks.loom", "second", settings));
	expect(replaceEmbedAt(note, note.lastIndexOf(original), original, replacement))
		.toBe(`# First\n${original}\n# Second\n${replacement}`);
});

it("refuses stale positions and changed destinations", () => {
	expect(() => replaceEmbedAt("changed note", 0, "![[tasks.loom]]", "new")).toThrow();
	expect(() => replaceEmbedDestination("![[other.loom]]", "tasks.loom", "new")).toThrow();
});
