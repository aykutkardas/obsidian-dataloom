/**
 * Decodes an uploaded file buffer into text, honoring a byte order mark.
 *
 * Reading the file with FileReader.readAsText always decoded it as UTF-8 and
 * kept the BOM character in the output, which garbled the first header of
 * BOM-prefixed files and turned UTF-16 files into mojibake (legacy #862).
 */
export type FileEncoding =
	| "auto"
	| "utf-8"
	| "utf-16le"
	| "utf-16be"
	| "gb18030"
	| "windows-1252";

const decode = (
	buffer: ArrayBuffer,
	encoding: Exclude<FileEncoding, "auto">,
	fatal = false
) =>
	new TextDecoder(encoding, {
		fatal,
	}).decode(buffer);

export const decodeFileBuffer = (
	buffer: ArrayBuffer,
	selectedEncoding: FileEncoding = "auto"
): string => {
	const bytes = new Uint8Array(buffer);
	if (selectedEncoding !== "auto") {
		return decode(buffer, selectedEncoding);
	}

	if (bytes.length >= 2) {
		if (bytes[0] === 0xff && bytes[1] === 0xfe) {
			return decode(buffer, "utf-16le");
		} else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
			return decode(buffer, "utf-16be");
		}
	}

	try {
		return decode(buffer, "utf-8", true);
	} catch {
		try {
			//Chinese versions of Excel commonly export legacy CSV files as
			//GBK/GB18030 rather than UTF-8 (legacy #862).
			return decode(buffer, "gb18030", true);
		} catch {
			return decode(buffer, "windows-1252");
		}
	}
};
