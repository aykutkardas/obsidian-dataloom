import {
	validateMarkdownTable,
	parseMarkdownTableIntoTokens,
	tableTokensToArr,
} from "./table-utils";

describe("validateMarkdownTable", () => {
	it("doesn't throw an error for a valid table", () => {
		//Arrange
		const table = `
            | Header 1 | Header 2 |
            |----------|----------|
            | Cell 1   | Cell 2   |
            | Cell 3   | Cell 4   |
        `;

		//Act
		const tokens = parseMarkdownTableIntoTokens(table);

		//Assert
		expect(() => validateMarkdownTable(tokens)).not.toThrow();
	});

	it("throws an error for a table with no headers", () => {
		//Arrange
		const markdown = `
            | Cell 1   | Cell 2   |
            | Cell 3   | Cell 4   |
        `;

		//Act
		const tokens = parseMarkdownTableIntoTokens(markdown);

		//Assert
		expect(() => validateMarkdownTable(tokens)).toThrow();
	});

	it("throws an error for a table with no rows", () => {
		//Arrange
		const markdown = `
            | Header 1 | Header 2 |
            |----------|----------|
        `;

		//Act
		const tokens = parseMarkdownTableIntoTokens(markdown);

		//Assert
		expect(() => validateMarkdownTable(tokens)).toThrow();
	});

	it("throws an error for multiple tables", () => {
		//Arrange
		const markdown = `
            | Header 1 | Header 2 |
            |----------|----------|
            | Cell 1   | Cell 2   |
            | Cell 3   | Cell 4   |

            | Header 1 | Header 2 |
            |----------|----------|
            | Cell 1   | Cell 2   |
            | Cell 3   | Cell 4   |
        `;

		//Act
		const tokens = parseMarkdownTableIntoTokens(markdown);

		//Assert
		expect(() => validateMarkdownTable(tokens)).toThrow();
	});
});

describe("tableTokensToArr", () => {
	it("converts tokens to an array", () => {
		//Arrange
		const markdown = `
            | Header 1 | Header 2 |
            |----------|----------|
            | Cell 1   | Cell 2   |
            | Cell 3   | Cell 4   |
        `;
		const tokens = parseMarkdownTableIntoTokens(markdown);

		//Act
		const tableData = tableTokensToArr(tokens);

		//Assert
		expect(tableData).toEqual([
			["Header 1", "Header 2"],
			["Cell 1", "Cell 2"],
			["Cell 3", "Cell 4"],
		]);
	});
});
