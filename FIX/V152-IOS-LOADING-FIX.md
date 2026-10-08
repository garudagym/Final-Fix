# V152 — iOS-style loading animation

## Added
- Global iOS/SF Pro-style loading overlay.
- 12-bar Apple-style spinner.
- Glass/blur loading card for light and dark mode.
- Loading feedback on button actions so the UI no longer appears frozen while an action is starting.
- Persistent loader for API requests under `/api/`.
- Existing `gfzBusy()` calls now keep the loader visible until the underlying request/upload finishes.
- Minimum display time prevents a distracting flash for very fast requests.
- Reduced-motion support.
- Close buttons and external links are excluded from the loading overlay.

## Deployment
Use the updated `public/index.html`. Hard refresh after deployment (`Ctrl+Shift+R`) because the loading controller is frontend code.
