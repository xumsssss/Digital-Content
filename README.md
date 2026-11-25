# Tasting Memory — Website

Tasting Memory 2030 product introduction website.

## Run locally on macOS

1. Unzip `Tasting_Memory_Website.zip`.
2. Open the `Tasting_Memory_Website` folder.
3. Double-click `start-local.command`.
4. If macOS blocks the script, right-click it and choose Open, or run the following command in Terminal from this folder:

   ```bash
   python3 -m http.server 8000
   ```

5. Open `http://localhost:8000` in your browser.

A local server is recommended because the 3D GLB model is loaded by JavaScript fetch. The website itself does not require an internet connection or remote CDN.

## Included

- `index.html` — one-page product website
- `style.css` — responsive visual design
- `app.js` — scroll reveals and local GLB/WebGL viewer interactions
- `assets/images/` — supplied hero render, wireframe, moodboard, app UI crops and 14 scenario crops
- `assets/models/tasting-memory.glb` — GLB extracted from the supplied `model(1).zip` model-viewer package

## Interaction

- Scroll to browse all sections; no CTA navigation buttons are used.
- Drag the 3D model to rotate; scroll over the viewer to zoom; double-click to reset.
- Select a component in Part Explorer to highlight its corresponding GLB mesh.
- Use the dial slider to rotate the Dial mesh.
- Press the MARK control to preview the button press state.
- Hover/select the six LED parts individually to highlight only the selected segment.

## Confirmed product information

- Dimensions: 6 × 10 × 1 cm
- Weight: 200 g
- Body: stainless steel
- Finish: semi-matte pearl coating
- Display: 5.54 cm wide × 3.56 cm high
- Strap: durable polyester webbing, specified for a 200 g device
- Charging: wireless charging from the rear
- Preference analysis: only liquors the user has tasted and then saved/favorited
- Booth guidance: indoor positioning system in the expo venue; the relevant directional LED segment illuminates

The product's strap load-bearing capacity should be validated through physical testing of the webbing, stitching, ring and connection hardware before manufacturing.

## Notes

- The provided app interface composite and scenario storyboard are split into separate image files for the page.
- The supplied 3D model is used without changing the product geometry. Its display mesh retains the black/off appearance from the model.
- No external fonts, scripts, image URLs, APIs or CDN dependencies are used. The system font stack is used as an offline-safe fallback for Pretendard.


## CMF section update
The original moodboard image is no longer displayed in the CMF section. It is replaced with a custom editorial-style CMF board built from HTML/CSS: material-inspired visual samples, a five-color palette, and concise form/surface/light principles.
