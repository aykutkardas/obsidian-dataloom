import Bubble from "src/react/shared/bubble";

interface Props {
	numActive: number;
	onDisableClick: () => void;
}

export default function ActiveFilterBubble({ numActive, onDisableClick }: Props) {
	if (numActive === 0) return <></>;

	const value = `${numActive} active filter${numActive > 1 ? "s" : ""}`;
	return (
		<div className="dataloom-active-filter-bubble">
			<Bubble value={value} canRemove removeAriaLabel="Disable all filters" onRemoveClick={onDisableClick} />
		</div>
	);
}
