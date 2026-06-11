# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js

## Deploying to Vercel (shareable public URL)

Quick steps to get this project online and share a link immediately:

1) Install Vercel CLI (if you want to deploy right now from your machine):

```bash
npm i -g vercel
```

2) Log in and deploy:

```bash
vercel login
# then
vercel --prod
```

This will build the project (running `npm run build`) and return a public URL you can share.

3) CI-based deployment (recommended for reproducible sharing):

- Connect this GitHub repository to Vercel using the Vercel dashboard. Every push to `main` (or `master`) will trigger a deploy.
- Alternatively, push to GitHub and use the provided GitHub Actions workflow at `.github/workflows/deploy-vercel.yml`. For the workflow you must add the secret `VERCEL_TOKEN` with a Vercel personal token in the repository secrets. The workflow uses `vercel --prod` to publish.

Notes on required Vercel settings:
- `vercel.json` is included and configured for a Vite static build (`dist` output).
- If you prefer GitHub Actions to set the project explicitly, add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as secrets and call `vercel --prod --confirm --token $VERCEL_TOKEN --org $VERCEL_ORG_ID --project $VERCEL_PROJECT_ID` in the workflow.

Security and sharing:
- The URL returned by Vercel is public by default. If you need restricted access, configure password protection in Vercel's dashboard or use Vercel teams with access controls.

If you want, I can:
- run a local build here to validate `npm run build` succeeds and report back, or
- deploy directly using the Vercel CLI if you provide the Vercel token (not recommended to paste tokens in chat) — instead I can give exact commands to run on your machine.

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# healthfab
