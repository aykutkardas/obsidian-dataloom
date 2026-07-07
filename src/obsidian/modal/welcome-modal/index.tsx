import { App, Modal, setIcon } from "obsidian";
import { renderDivider, setModalTitle } from "src/obsidian/shared";

import "./styles.css";

const GITHUB_REPO_URL = "https://github.com/aykutkardas/obsidian-dataloom";

export default class WelcomeModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { containerEl } = this;
		containerEl.addClass("dataloom-welcome-modal");
		setModalTitle(containerEl, "Welcome to DataLoom");

		const { contentEl } = this;
		contentEl.createDiv({
			text: "Weave together data from diverse sources into a cohesive table view.",
		});
		renderDivider(contentEl);

		contentEl.createEl("h5", {
			text: "Resources",
			cls: "dataloom-welcome-modal__title",
		});

		const cardContainerEl = contentEl.createDiv({
			cls: "dataloom-welcome-modal__card-container",
		});

		this.renderCard(
			cardContainerEl,
			"Features",
			"See everything DataLoom can do",
			`${GITHUB_REPO_URL}#features`,
			"table"
		);

		this.renderCard(
			cardContainerEl,
			"Screenshots",
			"See DataLoom in action",
			`${GITHUB_REPO_URL}#screenshots`,
			"image"
		);

		this.renderCard(
			cardContainerEl,
			"Report an issue",
			"Report a bug or request a feature on GitHub",
			`${GITHUB_REPO_URL}/issues`,
			"bug"
		);
	}

	private renderCard(
		contentEl: HTMLElement,
		title: string,
		description: string,
		link: string,
		iconId: string
	) {
		//Card
		const cardEl = contentEl.createDiv({
			cls: "dataloom-welcome-modal__card",
		});
		const iconEl = cardEl.createDiv();
		setIcon(iconEl, iconId);
		(iconEl.firstChild as HTMLElement).classList.add(
			"dataloom-welcome-modal__card-icon"
		);

		//Card container
		const cardContainerEl = cardEl.createDiv();

		cardContainerEl.createEl("h6", {
			text: title,
			cls: "dataloom-welcome-modal__card-title",
		});

		cardContainerEl.createEl("p", {
			text: description,
			cls: "dataloom-welcome-modal__card-description",
		});

		cardContainerEl.createEl("a", { text: "Get started", href: link });
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
