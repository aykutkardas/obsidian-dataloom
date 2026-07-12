import React from "react";
import Stack from "../../../shared/stack";
import Text from "../../../shared/text";

import { DataType } from "../../types";
import { getAcceptForDataType } from "../../utils";

import "./styles.css";
import Switch from "src/react/shared/switch";
import {
	decodeFileBuffer,
	FileEncoding,
} from "../../decode-file";
import Select from "src/react/shared/select";

interface Props {
	hasHeadersRow: boolean;
	fileName: string | null;
	dataType: DataType;
	onDataChange: (rawData: string, fileName: string) => void;
	onHeadersRowToggle: () => void;
}

export default function FileInput({
	hasHeadersRow,
	fileName,
	dataType,
	onDataChange,
	onHeadersRowToggle,
}: Props) {
	const [encoding, setEncoding] = React.useState<FileEncoding>("auto");
	const [fileBuffer, setFileBuffer] = React.useState<ArrayBuffer | null>(null);
	const encodingId = React.useId();

	function decodeAndUpdate(
		buffer: ArrayBuffer,
		selectedEncoding: FileEncoding,
		name: string
	) {
		const rawData = decodeFileBuffer(buffer, selectedEncoding);
		onDataChange(rawData, name);
	}

	function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] ?? null;
		if (!file) return;

		const reader = new FileReader();

		reader.onload = (e) => {
			const buffer = e.target?.result as ArrayBuffer | null;
			if (!buffer) return;
			setFileBuffer(buffer);
			decodeAndUpdate(buffer, encoding, file.name);
		};

		//Read as a buffer so the encoding can be detected from the byte
		//order mark instead of assuming BOM-less UTF-8 (legacy #862)
		reader.readAsArrayBuffer(file);
	}

	function handleEncodingChange(value: string) {
		const nextEncoding = value as FileEncoding;
		setEncoding(nextEncoding);
		if (fileBuffer && fileName) {
			decodeAndUpdate(fileBuffer, nextEncoding, fileName);
		}
	}
	const accept = getAcceptForDataType(dataType);
	return (
		<div className="dataloom-file-input">
			<Stack spacing="2xl">
				<Stack>
					<Text value={fileName ?? "No file chosen"} />
					<input
						type="file"
						accept={accept}
						onChange={handleUpload}
					/>
				</Stack>
				<Stack spacing="sm">
					<label htmlFor={encodingId}>File encoding</label>
					<Select
						id={encodingId}
						value={encoding}
						onChange={handleEncodingChange}
					>
						<option value="auto">Auto detect</option>
						<option value="utf-8">UTF-8</option>
						<option value="gb18030">Chinese (GB18030/GBK)</option>
						<option value="windows-1252">Western (Windows-1252)</option>
						<option value="utf-16le">UTF-16 LE</option>
						<option value="utf-16be">UTF-16 BE</option>
					</Select>
				</Stack>
				{accept === ".csv" && (
					<Stack spacing="sm">
						<label htmlFor="has-headers">
							First row contains headers
						</label>
						<Switch
							id="has-headers"
							value={hasHeadersRow}
							onToggle={onHeadersRowToggle}
						/>
					</Stack>
				)}
			</Stack>
		</div>
	);
}
