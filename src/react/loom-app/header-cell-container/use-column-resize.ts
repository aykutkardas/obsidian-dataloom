import type React from "react";
import { useRef } from "react";
import { useLoomState } from "src/react/loom-app/loom-state-provider";

export const useColumnResize = (
	columnId: string,
	onMove: (dist: number) => void
) => {
	const { setResizingColumnId } = useLoomState();

	//The x position of the mouse when it is pressed down
	//This should be the same for both mouse and touch events
	const mouseDownX = useRef(0);

	function handleMouseMove(e: MouseEvent) {
		const dist = e.pageX - mouseDownX.current;
		onMove(dist);
	}

	function handleTouchMove(e: TouchEvent) {
		//Prevent Obsidian events from firing
		e.stopPropagation();

		const dist = e.touches[0].pageX - mouseDownX.current;
		onMove(dist);
	}

	function handleMouseUp() {
		activeDocument.removeEventListener("mousemove", handleMouseMove);
		activeDocument.removeEventListener("mouseup", handleMouseUp);

		//Prevents the column menu from opening when the user releases the mouse
		setTimeout(() => {
			setResizingColumnId(null);
		}, 100);
	}

	function handleTouchEnd() {
		activeDocument.removeEventListener("touchmove", handleTouchMove);
		activeDocument.removeEventListener("touchend", handleTouchEnd);

		//Prevents the column menu from opening when the user releases the mouse
		setTimeout(() => {
			setResizingColumnId(null);
		}, 100);
	}

	function handleTouchStart(e: React.TouchEvent) {
		//If we double click, then don't resize
		if (e.detail >= 2) return;

		//Add event listeners
		activeDocument.addEventListener("touchmove", handleTouchMove);
		activeDocument.addEventListener("touchend", handleTouchEnd);

		//Set the current mouse position, this will be used to calculate the distance
		//the touch has moved
		mouseDownX.current = e.touches[0].pageX;
		setResizingColumnId(columnId);
	}

	function handleMouseDown(e: React.MouseEvent) {
		//If we double click, then don't resize
		if (e.detail >= 2) return;

		//Prevent drag and drop
		e.preventDefault();

		//Add event listeners
		activeDocument.addEventListener("mousemove", handleMouseMove);
		activeDocument.addEventListener("mouseup", handleMouseUp);

		//Set the current mouse position, this will be used to calculate the distance
		//the mouse has moved
		mouseDownX.current = e.pageX;
		setResizingColumnId(columnId);
	}

	return { handleMouseDown, handleTouchStart };
};
