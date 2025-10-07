# Interactive Quantum Tunneling Probability Visualizer

An interactive visualization that demonstrates quantum tunneling probabilities for various potential barriers. This repository contains a Vite + React web app and a separate Electron wrapper app located in `electron-tunneling-app/`.

## Highlights
- Interactive visualization of quantum tunneling probability vs. barrier parameters
- Live-editable React components (Vite dev server)
- Optional Electron wrapper for a desktop build

## Repository layout

- `index.html` - Vite entry HTML for the web app
- `src/` - React source for the web visualizer (Vite)
- `public/` - static assets for the web app
- `electron-tunneling-app/` - separate React + Electron wrapper app (Create React App style)
- `package.json` - root scripts and dependencies for the web app (Vite)

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

## Web app - development (Vite)

From the project root:

```bash
# install deps
npm install

# start dev server (Vite)
npm run start
```

Open http://localhost:3000 in your browser (Vite starts on port 3000 per `package.json` script). If your browser opens automatically in some environments, the `BROWSER=none` env in the start script prevents that.

To create a production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Electron app (desktop wrapper)

The Electron wrapper is in `electron-tunneling-app/`. It uses a React app (react-scripts) structure.

From the project root you can change into that folder and run the usual commands:

```bash
cd electron-tunneling-app
npm install
npm start      # runs the CRA dev server for the electron wrapper UI
npm run build  # builds the web assets for production
```

Note: There may be additional steps to package the Electron app depending on your packaging choices (electron-builder, electron-forge, etc.) — those are not included by default in this repo.

## Common issues & troubleshooting

- "My code won't run after I renamed files":
  - Check import paths and filenames for exact matches (case-sensitive on Linux/macOS). For example, confirm `index.html` points to the correct entry: `<script type="module" src="/src/index.jsx"></script>`.
  - If you renamed a React component file (App.jsx/App.js), update all imports that reference it.
  - Run the dev server and read the terminal + browser console errors — they usually show the missing module path.

- If `npm run start` fails with a port or host error, try a different port or run without `--host`.

- If git or GitHub operations fail in Codespaces due to permissions, create the repo on GitHub web and then add the remote locally (see below).

## Git / GitHub quick steps

If you haven’t already created a repo on GitHub, create one at https://github.com/new (name suggestion: `interactive-quantum-tunneling-visualizer`) and do NOT initialize it with a README (this repo already has one). Then push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/interactive-quantum-tunneling-visualizer.git
git branch -M main
git push -u origin main
```

If the remote already has commits (you initialized it on the web), either pull and merge first or, if you understand the consequences, force push:

```bash
# merge approach
git pull --rebase origin main
git push

# force approach (overwrites remote) — use with caution
git push --force origin main
```

## Contributing

Contributions are welcome. A minimal process:

1. Fork or clone the repo
2. Create a topic branch: `git checkout -b fix/some-bug`
3. Make changes and include tests where helpful
4. Open a pull request with a clear description

## License

This project includes a `LICENSE` file at the repository root. Follow its terms when using or contributing code.

## Need help?

If you'd like, I can:

- push this repository to a GitHub repo you create (paste the repo URL) and verify the remote, or
- update `package.json` name to match the repo name and commit that change, or
- try to reproduce any runtime error you're seeing if you paste the error logs from `npm run start`.

Happy to continue — tell me what you want next.
