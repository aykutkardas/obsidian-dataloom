import { Notice, requestUrl } from "obsidian";

interface GithubRelease {
	body: string;
	tag_name: string;
}

export const getLastestGithubRelease =
	async (): Promise<GithubRelease | null> => {
		try {
			const response = await requestUrl({
				url: "https://api.github.com/repos/aykutkardas/obsidian-dataloom/releases/latest",
				method: "GET",
			});
			return response.json as GithubRelease;
		} catch (err) {
			console.error(err);
			new Notice("Error fetching latest release");
			return null;
		}
	};
