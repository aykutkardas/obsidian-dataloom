/**
 * @jest-environment node
 */
import { decodeFileBuffer } from "./decode-file";

const toBuffer = (bytes: number[]): ArrayBuffer => {
	return new Uint8Array(bytes).buffer;
};

describe("decodeFileBuffer", () => {
	it("decodes plain UTF-8", () => {
		const buffer = new TextEncoder().encode("col1,col2\na,b").buffer;
		expect(decodeFileBuffer(buffer as ArrayBuffer)).toEqual(
			"col1,col2\na,b"
		);
	});

	it("strips a UTF-8 BOM", () => {
		const content = new TextEncoder().encode("col1,col2");
		const buffer = toBuffer([0xef, 0xbb, 0xbf, ...content]);
		expect(decodeFileBuffer(buffer)).toEqual("col1,col2");
	});

	it("decodes UTF-16 LE with a BOM", () => {
		const bytes: number[] = [0xff, 0xfe];
		for (const char of "ab,ç") {
			const code = char.charCodeAt(0);
			bytes.push(code & 0xff, code >> 8);
		}
		expect(decodeFileBuffer(toBuffer(bytes))).toEqual("ab,ç");
	});

	it("decodes UTF-16 BE with a BOM", () => {
		const bytes: number[] = [0xfe, 0xff];
		for (const char of "ab,ç") {
			const code = char.charCodeAt(0);
			bytes.push(code >> 8, code & 0xff);
		}
		expect(decodeFileBuffer(toBuffer(bytes))).toEqual("ab,ç");
	});

	it("decodes CJK content encoded as UTF-8", () => {
		const buffer = new TextEncoder().encode("名前,説明").buffer;
		expect(decodeFileBuffer(buffer as ArrayBuffer)).toEqual("名前,説明");
	});

	it("falls back to windows-1252 for non-UTF-8 content", () => {
		//"café" encoded in windows-1252: é = 0xe9, invalid as UTF-8
		const buffer = toBuffer([0x63, 0x61, 0x66, 0xe9]);
		expect(decodeFileBuffer(buffer)).toEqual("café");
	});

	it("auto-detects Chinese Excel content encoded as GB18030", () => {
		//"中文" encoded as GBK, which is a subset of GB18030
		const buffer = toBuffer([0xd6, 0xd0, 0xce, 0xc4]);
		expect(decodeFileBuffer(buffer)).toEqual("中文");
	});

	it("supports an explicit encoding override", () => {
		const buffer = toBuffer([0xd6, 0xd0, 0xce, 0xc4]);
		expect(decodeFileBuffer(buffer, "gb18030")).toEqual("中文");
	});
});
