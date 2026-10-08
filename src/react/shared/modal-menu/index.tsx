import React from "react";

import { LoomMenuOpenDirection, LoomMenuPosition } from "src/react/shared/menu/types";
import { useShiftMenu } from "src/react/shared/base-menu/utils";

import { useModalMount } from "src/react/shared/modal-mount-provider";
import BaseMenu from "src/react/shared/base-menu";

interface Props {
	id: string;
	isOpen: boolean;
	hideBorder?: boolean;
	position: LoomMenuPosition;
	openDirection?: LoomMenuOpenDirection;
	width?: number;
	height?: number;
	maxWidth?: number;
	maxHeight?: number;
	children: React.ReactNode;
}

export default function ModalMenu({
	id,
	isOpen,
	hideBorder = false,
	openDirection,
	position,
	width = 0,
	height = 0,
	maxHeight = 0,
	maxWidth = 0,
	children,
}: Props) {
	const ref = React.useRef<HTMLDivElement>(null);
	const { modalEl } = useModalMount();

	useShiftMenu(true, modalEl as HTMLElement, ref, position, isOpen, {
		openDirection,
	});

	return (
		<BaseMenu
			ref={ref}
			id={id}
			isOpen={isOpen}
			hideBorder={hideBorder}
			position={position}
			width={width}
			height={height}
			maxHeight={maxHeight}
			maxWidth={maxWidth}
		>
			{children}
		</BaseMenu>
	);
}
