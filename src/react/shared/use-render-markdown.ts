import React from "react";
import { useAppMount } from "src/react/loom-app/app-mount-provider";
import { appendOrReplaceFirstChild } from "src/shared/render/utils";
import { renderEmbed } from "src/obsidian/render-embed";
import { renderMarkdown } from "src/obsidian/render-markdown";

export const useRenderMarkdown = (
	markdown: string,
	options?: {
		isExternalLink?: boolean;
		isEmbed?: boolean;
	}
) => {
	const { app } = useAppMount();
	const { isEmbed = false, isExternalLink = false } = options ?? {};
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const renderRef = React.useRef<HTMLElement | null>(null);

	const { mountLeaf } = useAppMount();

	React.useEffect(() => {
		async function updateContainerRef() {
			let el = null;
			if (isEmbed) {
				el = await renderEmbed(app, mountLeaf, markdown);
			} else {
				el = await renderMarkdown(app, mountLeaf, markdown);
			}

			if (el) {
				//Set the markdown ref equal to the markdown element that we just created
				renderRef.current = el;

				//If the container ref is not null, append the element to the container
				if (containerRef.current)
					appendOrReplaceFirstChild(containerRef.current, el);
			}
		}

		void updateContainerRef();
	}, [app, markdown, mountLeaf, isExternalLink, isEmbed]);

	return {
		containerRef,
		renderRef,
	};
};
