/**
 * Decodes an uploaded file buffer into text, honoring a byte order mark.
 *
 * Reading the file with FileReader.readAsText always decoded it as UTF-8 and
 * kept the BOM character in the output, which garbled the first header of
 * BOM-prefixed files and turned UTF-16 files into mojibake (legacy #862).
 */
export const decodeFileBuffer = (buffer: ArrayBuffer): string => {
	const bytes = new Uint8Array(buffer);

	let encoding = "utf-8";
	if (bytes.length >= 2) {
		if (bytes[0] === 0xff && bytes[1] === 0xfe) {
			encoding = "utf-16le";
		} else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
			encoding = "utf-16be";
		}
	}

	try {
		//The default ignoreBOM: false strips a leading BOM while decoding.
		//fatal: true makes invalid UTF-8 throw so we can fall back below
		return new TextDecoder(encoding, {
			fatal: encoding === "utf-8",
		}).decode(buffer);
	} catch {
		//Not valid UTF-8 - assume a Windows-1252-style legacy encoding
		//instead of producing replacement characters
		return new TextDecoder("windows-1252").decode(buffer);
	}
};
