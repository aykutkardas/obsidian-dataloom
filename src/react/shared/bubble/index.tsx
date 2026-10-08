import React from "react";

import Stack from "../stack";
import Icon from "../icon";
import Button from "../button";

import "./styles.css";

interface Props {
	variant?: "default" | "no-fill";
	icon?: React.ReactNode;
	canRemove?: boolean;
	value: string;
	onRemoveClick?: () => void;
	removeAriaLabel?: string;
}

export default function Bubble({
	variant = "default",
	canRemove,
	icon,
	value,
	onRemoveClick,
	removeAriaLabel = "Remove sort",
}: Props) {
	let className = "dataloom-bubble";
	if (variant === "no-fill") {
		className += " dataloom-bubble--no-fill";
	}

	return (
		<div className={className}>
			<Stack spacing="lg" isHorizontal>
				<Stack spacing="sm" isHorizontal>
					{icon}
					<span>{value}</span>
				</Stack>
				{canRemove && (
					<Button
						size="sm"
						invertFocusColor
						icon={
							<Icon lucideId="x" color="var(--text-on-accent)" />
						}
						ariaLabel={removeAriaLabel}
						onClick={onRemoveClick}
					/>
				)}
			</Stack>
		</div>
	);
}
