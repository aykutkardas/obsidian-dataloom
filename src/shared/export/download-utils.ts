import { ExportType } from "./types";
import { LOOM_EXTENSION } from "src/data/constants";
import { setStyle } from "src/shared/dom-utils";

export const getBlobTypeForExportType = (type: ExportType) => {
	switch (type) {
		case ExportType.CSV:
			return "text/csv";
		case ExportType.MARKDOWN:
			return "text/markdown";
		default:
			throw new Error(`Unknown export type: ${type}`);
	}
};

export const getExportFileName = (filePath: string) => {
	const replaceExtension = filePath.replace(`.${LOOM_EXTENSION}`, "");
	const replaceSlash = replaceExtension.replace(/\//g, "-");
	const replaceSpaces = replaceSlash.replace(/ /g, "_");
	const now = new Date();
	const pad = (value: number) => String(value).padStart(2, "0");
	const timestamp = `${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(
		now.getDate()
	)}-${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(
		now.getSeconds()
	)}`;
	return replaceSpaces + "-" + timestamp;
};

export const downloadFile = (
	fileName: string,
	blobType: string,
	data: string
) => {
	if (blobType === "text/csv") {
		//Add BOM to force Excel to open the file with UTF-8 encoding
		data = "\uFEFF" + data;
	}
	//Create a blob object
	const blob = new Blob([data], { type: blobType });
	const url = window.URL.createObjectURL(blob);

	//Create a link element
	const el = activeDocument.createElement("a");
	el.setAttribute("href", url);
	el.setAttribute("download", fileName);
	setStyle(el, "display", "none");

	//Add the link element to the DOM
	activeDocument.body.appendChild(el);
	el.click();

	//Remove the link element from the DOM
	activeDocument.body.removeChild(el);
};
