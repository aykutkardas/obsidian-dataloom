export const setStyle = (
	el: HTMLElement,
	property: string,
	value: string
) => {
	el.style.setProperty(property, value);
};

/**
 * Creates a div via Obsidian's `activeDocument.createEl` helper.
 * Centralized so pop-out-window documents stay consistent and there is a
 * single point that satisfies the `obsidianmd/prefer-create-el` rule.
 */
export const createDiv = (options?: {
	cls?: string;
	text?: string;
}): HTMLDivElement => {
	const div = activeDocument.createEl("div");
	if (options?.cls) div.addClass(options.cls);
	if (options?.text) div.setText(options.text);
	return div;
};

/**
 * Creates an element via Obsidian's `activeDocument.createEl` helper.
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
	tag: K
): HTMLElementTagNameMap[K] => {
	return activeDocument.createEl(tag);
};

export const findAncestorsUntilClassName = (
	currentEl: HTMLElement,
	className: string
) => {
	const ancestors: HTMLElement[] = [];
	let el: HTMLElement | null = currentEl;

	while (el && !el.classList.contains(className)) {
		ancestors.push(el);
		el = el.parentElement;
	}
	return ancestors;
};

export const findAncestorWithClassName = (
	currentEl: HTMLElement,
	className: string
) => {
	let el: HTMLElement | null = currentEl;

	while (el && !el.classList.contains(className)) {
		if (el.classList.contains(className)) {
			return el;
		}
		el = el.parentElement;
	}
	return null;
};
