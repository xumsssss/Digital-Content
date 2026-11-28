# Tasting Memory — GitHub Pages (split assets)

This package keeps the main page lightweight by storing large media/model files in `assets/`.

## Upload to GitHub
1. Download and extract this ZIP on your computer.
2. Open your GitHub repository and choose **Add file → Upload files**.
3. Upload `index.html`, `README.md`, and the complete `assets` folder contents.
   - Keep the `assets` folder name and its files exactly as extracted.
   - Do not upload only `index.html`; the 3D models and video are separate files.
4. Commit the upload to the `main` branch.
5. Go to **Settings → Pages**.
6. Under **Build and deployment**, select **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.

All asset links are relative (`assets/...`), so the site works from the repository root / GitHub Pages root.
