# DataLoom Contributing Guide

## Issues

Issues are prioritized in the [project roadmap](https://github.com/users/aykutkardas/projects/2). However, you are welcome to work on whatever issue you would like.

If the code you wish to contribute is related to an existing issue, please make a comment on the related issue and tag @aykutkardas.

## Getting started

Start by cloning the repository

```shell
git clone https://github.com/aykutkardas/obsidian-dataloom.git
```

Use Node.js 24 and [pnpm](https://pnpm.io/) for dependency management. The pnpm version is pinned in package.json.

```shell
npm install --global pnpm@12.10.1
```

Change directories to the cloned repository

```shell
cd obsidian-dataloom
```

Install dependencies

```shell
pnpm install --frozen-lockfile
```

Build the project. This will create a `dist` folder

```shell
pnpm run build
```

Create a symbolic link from the cloned repository to your Obsidian vault. Be sure to link the `dist` folder. The target directory must match the plugin ID in `manifest.json` (`obisidian-dataloom`).

Note: I recommend making a new Obsidian vault just for development.

```shell
ln -s <repository-path>/dist <development-vault-path>/.obsidian/plugins/obisidian-dataloom
```

e.g

```shell
ln -s /users/decaf/desktop/obsidian-dataloom/dist /users/decaf/desktop/test-vault/.obsidian/plugins/obisidian-dataloom
```

Start a new branch from the latest `main` and open your pull request against `main`.

```shell
git switch main
git pull --ff-only
git switch -c <your-branch-name>
```

Open your vault in Obsidian

Enable DataLoom

## Development

Run esbuild in development mode

```shell
pnpm run dev
```

Restart Obsidian to see your code changes

Production builds (`pnpm run build`) minify JavaScript and CSS and use React's production mode. Function and class names are preserved for diagnostics. Development builds remain unminified with inline source maps.

To inspect bundle size by source file, run:

```shell
pnpm run build:analyze
```

This writes `dist/metafile.json` and `dist/bundle-analysis.txt` alongside the production assets. The metafile records esbuild's original `main.css` output name, which is renamed to `styles.css` for Obsidian after a successful build.

## Tests

Please make [Vitest](https://vitest.dev/) tests for the code that you create. Please note that some Obsidian functionality is very hard to test due to the library being an external dependency and closed source. If tests cannot be written, your code can be still be accepted. If you need help with writing tests, please DM @decaf_dev on discord.

## Pull requests

Once you have made your changes, make a pull request targeting `main`.

The pull request will be reviewed. Once it is approved, it will be merged into `main`.
