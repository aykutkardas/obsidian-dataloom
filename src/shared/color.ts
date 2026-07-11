import { Color } from "src/shared/loom-state/types/loom-state";

export const findColorClassName = (
	isDarkMode: boolean,
	color: Color
): string => {
	switch (color) {
		case Color.LIGHT_GRAY:
			return isDarkMode
				? "dataloom-light-gray--dark"
				: "dataloom-light-gray--light";
		case Color.GRAY:
			return isDarkMode ? "dataloom-gray--dark" : "dataloom-gray--light";
		case Color.BROWN:
			return isDarkMode
				? "dataloom-brown--dark"
				: "dataloom-brown--light";
		case Color.ORANGE:
			return isDarkMode
				? "dataloom-orange--dark"
				: "dataloom-orange--light";
		case Color.YELLOW:
			return isDarkMode
				? "dataloom-yellow--dark"
				: "dataloom-yellow--light";
		case Color.GREEN:
			return isDarkMode
				? "dataloom-green--dark"
				: "dataloom-green--light";
		case Color.BLUE:
			return isDarkMode ? "dataloom-blue--dark" : "dataloom-blue--light";
		case Color.PURPLE:
			return isDarkMode
				? "dataloom-purple--dark"
				: "dataloom-purple--light";
		case Color.PINK:
			return isDarkMode ? "dataloom-pink--dark" : "dataloom-pink--light";
		case Color.RED:
			return isDarkMode ? "dataloom-red--dark" : "dataloom-red--light";
		default:
			return "";
	}
};

export const randomColor = () => {
	const index = Math.floor(Math.random() * Object.values(Color).length);
	return Object.values(Color)[index];
};

/**
 * Picks a random color for a new tag, preferring colors that are not
 * already in use. When every color is in use, picks among the least-used
 * colors, avoiding the most recently used one when possible. This prevents
 * several new tags in a row from getting the same color (issue #3).
 *
 * @param usedColors - Colors already in use, in creation order
 */
export const randomUnusedColor = (usedColors: Color[]): Color => {
	const allColors = Object.values(Color);

	const unused = allColors.filter((color) => !usedColors.includes(color));
	if (unused.length > 0) {
		return unused[Math.floor(Math.random() * unused.length)];
	}

	//All colors are in use - pick among the least-used ones
	const counts = new Map<Color, number>();
	allColors.forEach((color) => counts.set(color, 0));
	usedColors.forEach((color) =>
		counts.set(color, (counts.get(color) ?? 0) + 1)
	);
	const minCount = Math.min(...counts.values());
	let candidates = allColors.filter(
		(color) => counts.get(color) === minCount
	);

	//Avoid repeating the most recently used color when there is a choice
	const mostRecent = usedColors[usedColors.length - 1];
	if (candidates.length > 1) {
		candidates = candidates.filter((color) => color !== mostRecent);
	}
	return candidates[Math.floor(Math.random() * candidates.length)];
};
