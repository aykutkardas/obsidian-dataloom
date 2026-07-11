import React from "react";

import TagColorMenu from "src/react/loom-app/tag-color-menu";
import MenuButton from "src/react/shared/menu-button";
import Icon from "src/react/shared/icon";
import Tag from "src/react/shared/tag";
import Stack from "src/react/shared/stack";

import { Color } from "src/shared/loom-state/types/loom-state";
import { LoomMenuLevel } from "src/react/shared/menu-provider/types";
import { useMenu } from "src/react/shared/menu-provider/hooks";

import "./styles.css";

interface Props {
	id: string;
	content: string;
	color: Color;
	dragIndicator: "top" | "bottom" | null;
	onClick: (tagId: string) => void;
	onColorChange: (tagId: string, color: Color) => void;
	onDeleteClick: (tagId: string) => void;
	onTagContentChange: (tagId: string, value: string) => void;
	onDrop: (dragId: string, targetId: string) => void;
	onDragStart: (tagId: string) => void;
	onDragOver: (tagId: string) => void;
	onDragEnd: () => void;
}

export default function SelectableTag({
	id,
	content,
	color,
	dragIndicator,
	onClick,
	onColorChange,
	onDeleteClick,
	onTagContentChange,
	onDrop,
	onDragStart,
	onDragOver,
	onDragEnd,
}: Props) {
	const COMPONENT_ID = `selectable-tag-${id}`;
	const menu = useMenu(COMPONENT_ID);
	const rowRef = React.useRef<HTMLDivElement>(null);

	function handleColorChange(color: Color) {
		onColorChange(id, color);
		menu.onClose();
	}

	function handleDeleteClick() {
		onDeleteClick(id);
		menu.onClose();
	}

	function handleTagContentChange(value: string) {
		onTagContentChange(id, value);
		menu.onClose();
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") {
			//Stop propagation so the the menu doesn't remove the focus class
			e.stopPropagation();
			onClick(id);
		}
	}

	function handleClick(e: React.MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.classList.contains("dataloom-menu-trigger")) return;

		//Stop propagation so the the menu doesn't remove the focus class
		e.stopPropagation();
		onClick(id);
	}

	function handleDragStart(e: React.DragEvent) {
		e.dataTransfer.setData("text/plain", id);
		e.dataTransfer.effectAllowed = "move";

		//The drag starts from the grip handle, so the browser would only
		//show the grip as the drag preview. Use the whole tag row instead.
		const rowEl = rowRef.current;
		if (rowEl) {
			const rect = rowEl.getBoundingClientRect();
			e.dataTransfer.setDragImage(
				rowEl,
				e.clientX - rect.left,
				e.clientY - rect.top
			);
		}
		onDragStart(id);
	}

	function handleDragOver(e: React.DragEvent) {
		//Allow drop
		e.preventDefault();
		onDragOver(id);
	}

	function handleDragEnd() {
		onDragEnd();
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		e.stopPropagation();

		const dragId = e.dataTransfer.getData("text/plain");
		if (dragId === "" || dragId === id) return;
		onDrop(dragId, id);
	}

	let className =
		"dataloom-selectable-tag dataloom-focusable dataloom-selectable";
	if (dragIndicator === "top") {
		className += " dataloom-selectable-tag--drag-over-top";
	} else if (dragIndicator === "bottom") {
		className += " dataloom-selectable-tag--drag-over-bottom";
	}

	return (
		<>
			<div
				ref={rowRef}
				tabIndex={0}
				className={className}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<Stack isHorizontal spacing="sm" align="center">
					<div
						className="dataloom-selectable-tag__drag-handle"
						aria-label="Drag to reorder"
						draggable
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						onClick={(e) => e.stopPropagation()}
					>
						<Icon lucideId="grip-vertical" size="sm" />
					</div>
					<Tag content={content} color={color} maxWidth="150px" />
				</Stack>
				<MenuButton
					isFocused={menu.isTriggerFocused}
					menuId={menu.id}
					ref={menu.triggerRef}
					level={LoomMenuLevel.TWO}
					icon={<Icon lucideId="more-horizontal" />}
					onOpen={() =>
						menu.onOpen(LoomMenuLevel.TWO, {
							shouldRequestOnClose: true,
						})
					}
				/>
			</div>
			<TagColorMenu
				isOpen={menu.isOpen}
				id={menu.id}
				position={menu.position}
				closeRequest={menu.closeRequest}
				content={content}
				selectedColor={color}
				onColorClick={(color) => handleColorChange(color)}
				onDeleteClick={handleDeleteClick}
				onTagContentChange={handleTagContentChange}
				onClose={menu.onClose}
			/>
		</>
	);
}
