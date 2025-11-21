import { App, MarkdownRenderer, MarkdownView, WorkspaceLeaf } from "obsidian";
import DataLoomView from "src/obsidian/dataloom-view";
import "src/shared/render/styles.css";

const renderText = async (app: App, leaf: WorkspaceLeaf, value: string) => {
	const div = document.createElement("div");
	div.classList.add("dataloom-markdown-container");

	try {
		const view = leaf.view;
		if (view instanceof MarkdownView || view instanceof DataLoomView) {
			await MarkdownRenderer.render(
				app,
				value,
				div,
				view.file?.path ?? "",
				view
			);
		}
	} catch (e) {
		console.error(e);
	}
	return div;
};

export const renderEmbed = async (
	app: App,
	leaf: WorkspaceLeaf,
	value: string
) => {
	return renderText(app, leaf, value);
};
