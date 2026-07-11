import React from "react";

import MenuHeader from "./menu-header";
import MenuBody from "./menu-body";

import { Tag as TagType } from "src/shared/loom-state/types/loom-state";
import { Color } from "src/shared/loom-state/types/loom-state";
import { randomUnusedColor } from "src/shared/color";
import { LoomMenuCloseRequest } from "src/react/shared/menu-provider/types";

interface Props {
	isMulti?: boolean;
	columnTags: TagType[];
	cellTags: TagType[];
	closeRequest: LoomMenuCloseRequest | null;
	onTagClick: (tagId: string) => void;
	onTagAdd: (markdown: string, color: Color) => void;
	onRemoveTag: (tagId: string) => void;
	onTagColorChange: (tagId: string, color: Color) => void;
	onTagDelete: (tagId: string) => void;
	onTagContentChange: (tagId: string, value: string) => void;
	onTagReorder: (dragId: string, targetId: string) => void;
	onClose: () => void;
}

export default function TagCellEdit({
	isMulti = false,
	columnTags,
	cellTags,
	closeRequest,
	onTagClick,
	onTagAdd,
	onTagColorChange,
	onTagDelete,
	onRemoveTag,
	onTagContentChange,
	onTagReorder,
	onClose,
}: Props) {
	const [inputValue, setInputValue] = React.useState("");
	const [newTagColor, setNewTagColor] = React.useState(() =>
		randomUnusedColor(columnTags.map((tag) => tag.color))
	);

	const handleTagAdd = React.useCallback(
		(markdown: string, color: Color) => {
			onTagAdd(markdown, color);
			setInputValue("");
			//Include the just-added color since columnTags hasn't updated yet
			setNewTagColor(
				randomUnusedColor([
					...columnTags.map((tag) => tag.color),
					color,
				])
			);
			if (!isMulti) onClose();
		},
		[isMulti, columnTags, onTagAdd, onClose]
	);

	React.useEffect(() => {
		if (closeRequest !== null) {
			if (closeRequest.type === "close-on-save") {
				if (inputValue !== "") {
					const doesTagExist = columnTags.find(
						(tag) => tag.content === inputValue
					);
					if (!doesTagExist) {
						handleTagAdd(inputValue, newTagColor);
						return;
					}
				}
			}
			onClose();
		}
	}, [
		handleTagAdd,
		columnTags,
		inputValue,
		newTagColor,
		closeRequest,
		onClose,
	]);

	function handleTagClick(id: string) {
		onTagClick(id);
		if (!isMulti) onClose();
	}

	return (
		<div className="dataloom-tag-cell-edit">
			<MenuHeader
				inputValue={inputValue}
				cellTags={cellTags}
				onInputValueChange={setInputValue}
				onRemoveTag={onRemoveTag}
			/>
			<MenuBody
				inputValue={inputValue}
				columnTags={columnTags}
				newTagColor={newTagColor}
				onTagAdd={handleTagAdd}
				onTagClick={handleTagClick}
				onTagDelete={onTagDelete}
				onTagColorChange={onTagColorChange}
				onTagContentChange={onTagContentChange}
				onTagReorder={onTagReorder}
			/>
		</div>
	);
}
