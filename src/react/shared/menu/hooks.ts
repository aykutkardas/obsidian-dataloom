import React from "react";

import { throttle } from "es-toolkit";

import { getPositionFromEl } from "../menu-provider/utils";
import { PositionUpdateHandler } from "../menu-provider/types";
import { findAncestorsUntilClassName } from "src/shared/dom-utils";

export const useMenuPosition = (
	isOpen: boolean,
	isParentObsidianModal: boolean,
	onPositionUpdate: PositionUpdateHandler,
	anchorRef?: React.RefObject<HTMLDivElement>
) => {
	const className = isParentObsidianModal ? "modal" : "view-content";
	const ref = useBasePosition(className, isOpen, onPositionUpdate, anchorRef);
	return ref;
};

const useBasePosition = (
	className: string,
	isOpen: boolean,
	onPositionUpdate: PositionUpdateHandler,
	anchorRef?: React.RefObject<HTMLDivElement>
) => {
	const ownRef = React.useRef<HTMLDivElement>(null);
	const ref = anchorRef ?? ownRef;

	React.useEffect(() => {
		if (!ref.current) return;
		const positionEl = ref.current;

		const THROTTLE_TIME_MILLIS = 50;
		const throttleUpdatePosition = throttle(
			updatePosition,
			THROTTLE_TIME_MILLIS
		);

		function updatePosition() {
			const position = getPositionFromEl(positionEl);
			onPositionUpdate(position);
		}

		const ancestors = findAncestorsUntilClassName(positionEl, className);

		if (isOpen) {
			ancestors.forEach((ancestor) => {
				ancestor.addEventListener("scroll", throttleUpdatePosition);
				ancestor.addEventListener("resize", throttleUpdatePosition);
			});
			window.addEventListener("resize", throttleUpdatePosition);

			updatePosition();
		}

		return () => {
			ancestors.forEach((ancestor) => {
				ancestor.removeEventListener("scroll", throttleUpdatePosition);
				ancestor.removeEventListener("resize", throttleUpdatePosition);
			});
			window.removeEventListener("resize", throttleUpdatePosition);
		};
	}, [className, isOpen, onPositionUpdate, ref]);

	return ref;
};
