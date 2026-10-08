import { App, MarkdownRenderer, MarkdownView, WorkspaceLeaf } from "obsidian";
import DataLoomView, { DATA_LOOM_VIEW } from "./dataloom-view";
import { replaceNewLinesWithBr } from "src/shared/render/utils";
import { handleLinkClick } from "./link-events";
import { createElement, setStyle } from "src/shared/dom-utils";

export const renderMarkdown = async (
	app: App,
	leaf: WorkspaceLeaf,
	markdown: string
) => {
	const div = createElement("div");
	setStyle(div, "height", "100%");
	setStyle(div, "width", "100%");

	//We need to attach this class so that the `is-unresolved` link renders properly by Obsidian
	const view = leaf.view;
	if (view instanceof DataLoomView) div.classList.add("markdown-rendered");

	try {
		const formattedMarkdown = replaceNewLinesWithBr(markdown);
		const view = leaf?.view;

		if (view instanceof MarkdownView || view instanceof DataLoomView) {
			const file = view.file;
			if (file === null) return div;

			await MarkdownRenderer.render(
				app,
				formattedMarkdown,
				div,
				file.path,
				view
			);

			const embeds = div.querySelectorAll(".internal-link");
			embeds.forEach((embed) => {
				const el = embed as HTMLAnchorElement;
				const href = el.getAttribute("data-href");
				if (!href) return;

				const destination = app.metadataCache.getFirstLinkpathDest(
					href,
					file.path
				);
				if (!destination) embed.classList.add("is-unresolved");

				el.addEventListener("mouseover", (e) => {
					e.stopPropagation();
					app.workspace.trigger("hover-link", {
						event: e,
						source: DATA_LOOM_VIEW,
						hoverParent: view.containerEl,
						targetEl: el,
						linktext: href,
						sourcePath: el.href,
					});
				});

				el.addEventListener("click", (e) => handleLinkClick(app, e));
			});
		}
	} catch (e) {
		console.error(e);
	}
	return div;
};
