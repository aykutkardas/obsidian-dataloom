export const setStyle = (
	el: HTMLElement,
	property: string,
	value: string
) => {
	el.style.setProperty(property, value);
};



/**
 * Creates a detached element in the active document. Node.createEl appends
 * to its receiver, so use a fragment instead of the Document itself.
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
	tag: K
): HTMLElementTagNameMap[K] => {
	return activeDocument.createDocumentFragment().createEl(tag);
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
