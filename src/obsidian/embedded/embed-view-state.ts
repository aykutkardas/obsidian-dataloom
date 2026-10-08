import { Array as RtArray, Literal, Record as RtRecord, String as RtString, Union } from "runtypes";
import { FilterObject } from "src/shared/loom-state/validate-state";
import { LoomViewState } from "src/shared/loom-state/view-state";
import { SortDir } from "src/shared/loom-state/types/loom-state";

const MARKER = "#dataloom-view=";
const SavedView = RtRecord({
	version: Literal(1),
	id: RtString,
	filters: RtArray(FilterObject),
	sorts: RtArray(RtRecord({
		columnId: RtString,
		direction: Union(Literal(SortDir.NONE), Literal(SortDir.ASC), Literal(SortDir.DESC)),
	})),
});

export function getLoomLinkPath(src: string): string {
	return src.split("#")[0];
}

export function readEmbedView(src: string): (LoomViewState & { id: string }) | undefined {
	const index = src.indexOf(MARKER);
	if (index < 0) return undefined;
	try {
		const value: unknown = JSON.parse(decodeURIComponent(src.slice(index + MARKER.length)));
		if (SavedView.guard(value)) return value;
	} catch {
		// A malformed or future version must not prevent the table from opening.
	}
	return undefined;
}

export function writeEmbedView(src: string, id: string, view: LoomViewState): string {
	return getLoomLinkPath(src) + MARKER + encodeURIComponent(JSON.stringify({
		version: 1, id, filters: view.filters, sorts: view.sorts,
	}));
}

/** Change only the destination; retain the embed's size, alias and Markdown style. */
export function replaceEmbedDestination(original: string, source: string, next: string): string {
	if (original.startsWith("![[")) {
		const end = original.indexOf("|") >= 0 ? original.indexOf("|") : original.length - 2;
		if (original.slice(3, end) !== source) throw new Error("Embed destination changed");
		return original.slice(0, 3) + next + original.slice(end);
	}
	const start = original.indexOf("](") + 2;
	if (start < 2 || !original.startsWith("![")) throw new Error("Unsupported embed syntax");
	const destination = original[start] === "<" ? start + 1 : start;
	const encodedSource = encodeURI(source);
	const old = original.slice(destination).startsWith(source) ? source : encodedSource;
	if (!original.slice(destination).startsWith(old)) throw new Error("Embed destination changed");
	const suffix = original.slice(destination + old.length);
	if (!/^(?:>|\s|\))/.test(suffix)) throw new Error("Embed destination changed");
	return original.slice(0, destination) + next.replace(/ /g, "%20") + suffix;
}

/** Refuse stale offsets rather than editing another occurrence of the same loom. */
export function replaceEmbedAt(content: string, offset: number, original: string, replacement: string): string {
	if (content.slice(offset, offset + original.length) !== original) {
		throw new Error("The note changed before the embed settings could be saved. Try again after it finishes updating.");
	}
	return content.slice(0, offset) + replacement + content.slice(offset + original.length);
}
