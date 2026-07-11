import { App } from "obsidian";
import { deserializeFrontmatterForCell } from ".";
import { createColumn } from "../loom-state/loom-state-factory";
import {
	CellType,
	CheckboxCell,
	MultiTagCell,
	NumberCell,
	TextCell,
} from "../loom-state/types/loom-state";

const FRONTMATTER: Record<string, Record<string, unknown>> = {
	"file.md": {
		text: "text value",
		number: 123456,
		zero: 0,
		checked: true,
		unchecked: false,
		tags: ["tag1", "tag2"],
		"key with spaces": ["tag1", "tag2"],
		"single value list": "tag1",
		"numeric list": [1, 2],
		"not a list": true,
		"invalid checkbox": "yes",
	},
};

const app = {
	metadataCache: {
		getCache: (path: string) => {
			const frontmatter = FRONTMATTER[path];
			if (!frontmatter) return null;
			return { frontmatter };
		},
	},
} as unknown as App;

const createColumnWithKey = (type: CellType, frontmatterKey: string) => {
	const column = createColumn({ type });
	column.frontmatterKey = frontmatterKey;
	return column;
};

describe("deserializeFrontmatterForCell", () => {
	it("deserializes text content", () => {
		const column = createColumnWithKey(CellType.TEXT, "text");
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect((result?.newCell as TextCell).content).toEqual("text value");
	});

	it("deserializes number content", () => {
		const column = createColumnWithKey(CellType.NUMBER, "number");
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect((result?.newCell as NumberCell).value).toEqual(123456);
	});

	it("deserializes the number 0", () => {
		const column = createColumnWithKey(CellType.NUMBER, "zero");
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect(result).not.toBeNull();
		expect((result?.newCell as NumberCell).value).toEqual(0);
	});

	it("deserializes a false checkbox value", () => {
		const column = createColumnWithKey(CellType.CHECKBOX, "unchecked");
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect(result).not.toBeNull();
		expect((result?.newCell as CheckboxCell).value).toEqual(false);
		expect(result?.newCell.hasValidFrontmatter).toEqual(true);
	});

	it("marks a non-boolean checkbox value as invalid", () => {
		const column = createColumnWithKey(
			CellType.CHECKBOX,
			"invalid checkbox"
		);
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect(result?.newCell.hasValidFrontmatter).toEqual(false);
	});

	it("deserializes multi-tag content", () => {
		const column = createColumnWithKey(CellType.MULTI_TAG, "tags");
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect((result?.newCell as MultiTagCell).tagIds).toHaveLength(2);
		expect(result?.nextTags?.map((tag) => tag.content)).toEqual([
			"tag1",
			"tag2",
		]);
	});

	it("deserializes multi-tag content from a key that contains spaces", () => {
		const column = createColumnWithKey(
			CellType.MULTI_TAG,
			"key with spaces"
		);
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect((result?.newCell as MultiTagCell).tagIds).toHaveLength(2);
		expect(result?.newCell.hasValidFrontmatter).toEqual(true);
	});

	it("deserializes multi-tag content from a scalar string value", () => {
		const column = createColumnWithKey(
			CellType.MULTI_TAG,
			"single value list"
		);
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect((result?.newCell as MultiTagCell).tagIds).toHaveLength(1);
		expect(result?.nextTags?.map((tag) => tag.content)).toEqual(["tag1"]);
	});

	it("deserializes multi-tag content from a list of numbers", () => {
		const column = createColumnWithKey(CellType.MULTI_TAG, "numeric list");
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect((result?.newCell as MultiTagCell).tagIds).toHaveLength(2);
		expect(result?.nextTags?.map((tag) => tag.content)).toEqual(["1", "2"]);
	});

	it("marks a non-list multi-tag value as invalid", () => {
		const column = createColumnWithKey(CellType.MULTI_TAG, "not a list");
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect(result?.newCell.hasValidFrontmatter).toEqual(false);
	});

	it("returns null if the column has no frontmatter key", () => {
		const column = createColumn({ type: CellType.TEXT });
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect(result).toBeNull();
	});

	it("returns null if no frontmatter value exists for the key", () => {
		const column = createColumnWithKey(CellType.TEXT, "missing");
		const result = deserializeFrontmatterForCell(app, column, "file.md");
		expect(result).toBeNull();
	});
});
