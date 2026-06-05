# File Upload Manager

A single-page file upload manager built with React Router v7, Vite, and TypeScript. Upload, view, and delete files from the browser with server-side validation and image previews.

## Quick Start

```bash
pnpm install
pnpm dev
```

The dev server runs at [http://localhost:5173](http://localhost:5173).

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server (localhost:5173) |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production build |
| `pnpm test` | Run unit tests |
| `pnpm test:coverage` | Run unit tests with coverage |
| `pnpm test:e2e` | Run end-to-end tests |

## Features

- **Upload files** up to 20 MB via a drag-and-drop–friendly interface
- **View uploaded files** in a list with name and human-readable size
- **Image previews** — thumbnails render inline for image files
- **Delete files** with a confirmation dialog
- **Zod v4.4.3** schema validation on both the server (`parse`) and client (`safeParse`)
- **SSR-ready** — the file list is server-rendered on page load

## Project Structure

```
app/
  root.tsx                 # Root layout (HTML shell)
  routes.ts                # Route definitions
  routes/home.tsx          # UI + loader (file list + upload form)
  routes/api.upload.tsx    # POST action — save uploaded file
  routes/api.upload.$filename.tsx  # GET file / DELETE file
  lib/
    uploads.server.ts      # Disk operations (save, list, dir resolution)
    files.ts               # Size formatting, MIME inference, image detection
    file.schema.ts         # Zod schema for file metadata
    upload.schema.ts       # Zod schema for upload validation
    error.ts               # Structured Zod error formatting
e2e/
  upload.spec.ts           # Playwright end-to-end tests
```

## Constraints

- Maximum file size: **20 MB**
- Files are stored on disk as `<uuid>__<originalname>` in the `uploads/` directory
- Image types supported: PNG, JPG, JPEG, GIF, WebP, SVG

## Testing

Unit tests run in a Node environment via Vitest. E2E tests run via Playwright against a live dev server — each test gets an isolated temp directory for uploads via a cookie fixture.

## Tech Stack

React 19 · React Router v7 · Vite 8 · TypeScript 6 · Zod v4 · Pico CSS · Vitest · Playwright
