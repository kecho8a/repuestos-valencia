<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/554014c5-51c9-4adf-8315-982774fd85db

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

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
5. Optionally, configure the GitHub Action workflow file at `.github/workflows/deploy-cloudflare-pages.yml` to deploy automatically on pushes to `main`.

### GitHub Action secrets

Create these repository secrets in GitHub if you use the workflow:
- `CF_PAGES_API_TOKEN`
- `CF_ACCOUNT_ID`
- `CF_PROJECT_NAME`
