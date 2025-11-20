# Free Fire Global — Tournament Hub

This is a single-page, responsive tournament website built with pure HTML, CSS, and JavaScript. It shows upcoming tournaments, allows searching/filtering, and provides a registration modal.

How to run locally

- Option 1 — Open directly:
  - Open `index.html` in your browser. Some browsers block `fetch` or module features when opened via `file://`, so for best results use a local server.

- Option 2 — Quick local server (PowerShell / Windows):
```powershell
cd 'C:\Users\GEU\Desktop\1'
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Notes
- No external frameworks used — only Google Fonts and Unsplash images.
- Registrations are saved to `localStorage` (key `ffg_registrations`) for demo purposes.
- To customize tournaments, edit `scripts.js` and modify the `tournaments` array.

 Want changes?
 
 Image uploader
 - The site includes a client-side image uploader with drag-and-drop, thumbnail previews, and delete buttons.
 - Limits: allowed formats JPG/PNG/WEBP; max file size 5MB; combined demo cap ~25MB.
 - Files are kept in-memory (Object URLs) in the browser — implement server upload to persist files.
- I can add server-side registration handling, email confirmation, or pagination. Tell me which feature you'd like next.
