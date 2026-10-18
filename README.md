# Manvendra Singh — Project Manager Portfolio

A fast, dependency-free static portfolio designed for direct hosting on GitHub Pages.

## Preview locally

Open `index.html` directly, or run any static HTTP server from this folder.

## Deploy on GitHub Pages

1. Push this folder to a GitHub repository.
2. In **Settings → Pages**, select **Deploy from a branch**.
3. Choose the `main` branch and `/ (root)` folder, then save.

No build command is required.

## Profile image

The hero uses the supplied photo at `assets/manvendra-profile.png`. Replace that file to update the image without changing the page markup.

## Add verified achievements and certificates

The portfolio intentionally avoids inventing private LinkedIn details. Replace or expand the themed items in `achievements.html` and `certificates.html` with verified role outcomes, credential names, issuer dates, and certificate assets.

## Add the résumé PDF

The portfolio currently shows a résumé preview notice and a disabled download control. Once the original PDF is supplied, place it at `assets/manvendra-singh-resume.pdf`, point the preview dialog to that file, and convert the Contact button into a download link. Copy the same PDF to `dist/assets/` before publishing the hosted build.
