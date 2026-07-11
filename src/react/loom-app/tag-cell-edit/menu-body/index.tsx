import React from "react";

import Padding from "src/react/shared/padding";
import Text from "src/react/shared/text";
import { Color } from "src/shared/loom-state/types/loom-state";
import { Tag } from "src/shared/loom-state/types/loom-state";
import CreateTag from "../create-tag";
import SelectableTag from "../selectable-tag";

import "./styles.css";

interface MenuBodyProps {
	columnTags: Tag[];
	inputValue: string;
	newTagColor: Color;
	onTagAdd: (markdown: string, color: Color) => void;
	onTagClick: (tagId: string) => void;
	onTagColorChange: (tagId: string, color: Color) => void;
	onTagDelete: (tagId: string) => void;
	onTagContentChange: (tagId: string, value: string) => void;
	onTagReorder: (dragId: string, targetId: string) => void;
}

export default function MenuBody({
	columnTags,
	inputValue,
	newTagColor,
	onTagAdd,
	onTagClick,
	onTagColorChange,
	onTagDelete,
	onTagContentChange,
	onTagReorder,
}: MenuBodyProps) {
	//Drag state used to render an insertion indicator on the row that is
	//being dragged over. dataTransfer can't be read during dragover, so the
	//dragged tag id is tracked here instead.
	const [dragId, setDragId] = React.useState<string | null>(null);
	const [dragOverId, setDragOverId] = React.useState<string | null>(null);

	function handleTagDragStart(id: string) {
		setDragId(id);
	}

	function handleTagDragOver(id: string) {
		setDragOverId((prev) => (prev === id ? prev : id));
	}

	function handleTagDragEnd() {
		setDragId(null);
		setDragOverId(null);
	}

	const hasTagWithSameCase =
		columnTags.find((tag) => tag.content === inputValue) !== undefined;
	const filteredTags = columnTags.filter((tag) =>
		tag.content.toLowerCase().includes(inputValue.toLowerCase())
	);

	return (
		<div className="dataloom-tag-cell-edit__menu-body">
			<Padding px="lg" py="md">
				<Text value="Select a tag or create one" />
			</Padding>
			<div className="dataloom-tag-cell-edit__menu-body-container">
				{!hasTagWithSameCase && inputValue !== "" && (
					<CreateTag
						content={inputValue}
						color={newTagColor}
						onTagAdd={onTagAdd}
					/>
				)}
				{filteredTags.map((tag) => {
					//Show where the dragged tag will land: below the target
					//when dragging down, above it when dragging up. This
					//matches the insertion behavior of TagReorderCommand.
					let dragIndicator: "top" | "bottom" | null = null;
					if (
						dragId !== null &&
						dragOverId === tag.id &&
						dragId !== tag.id
					) {
						const dragIndex = columnTags.findIndex(
							(t) => t.id === dragId
						);
						const overIndex = columnTags.findIndex(
							(t) => t.id === tag.id
						);
						dragIndicator =
							dragIndex < overIndex ? "bottom" : "top";
					}

					return (
						<SelectableTag
							key={tag.id}
							id={tag.id}
							color={tag.color}
							content={tag.content}
							dragIndicator={dragIndicator}
							onColorChange={onTagColorChange}
							onClick={onTagClick}
							onDeleteClick={onTagDelete}
							onTagContentChange={onTagContentChange}
							onDrop={onTagReorder}
							onDragStart={handleTagDragStart}
							onDragOver={handleTagDragOver}
							onDragEnd={handleTagDragEnd}
						/>
					);
				})}
			</div>
		</div>
	);
}
