<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TuRepuestoValencia

This repository contains everything you need to run the app locally and deploy it to Cloudflare Pages.

View your app in AI Studio: https://ai.studio/apps/554014c5-51c9-4adf-8315-982774fd85db

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm start`
3. Open the browser at:
   `http://localhost:3000`

> Important: do not open `index.html` directly from the file system. The app must run through Vite.

## Preview production build locally

After building, serve the `dist` folder with a static server:

```bash
npm run build
npx serve dist
```

or:

```bash
npx http-server dist -p 8080
```

## Deploy to Cloudflare Pages

1. Connect this repository to Cloudflare Pages in the Cloudflare dashboard.
2. Set the build command to:
   `npm run build`
3. Set the build output directory to:
   `dist`
4. If your app requires Gemini at build time, add the environment variable:
   `GEMINI_API_KEY`

> Note: this project currently does not use Gemini in the frontend source code, so that environment variable is optional unless you add Gemini-specific features later.

5. Optionally, configure the GitHub Action workflow file at `.github/workflows/deploy-cloudflare-pages.yml` to deploy automatically on pushes to `main`.

### GitHub Action secrets

Create these repository secrets in GitHub if you use the workflow:
- `CF_PAGES_API_TOKEN`
- `CF_ACCOUNT_ID`
- `CF_PROJECT_NAME`
