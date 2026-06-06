# Pension Ask Us — Web

React + TypeScript single-page app for the Pension Ask Us RAG API.
Builds to a static bundle and deploys independently of the backend.

## Stack

- **Vite 5** + **React 18** + **TypeScript 5**
- **Vitest** + **Testing Library** for unit tests
- A single hand-rolled `styles.css` — no UI framework, no Tailwind
- Nginx (in the Docker image) for static serving with SPA history fallback

## Layout

```
src/
├── api/
│   ├── types.ts       Mirrors the backend Pydantic schemas
│   └── client.ts      Typed fetch wrapper; throws ApiError on backend errors
├── components/
│   ├── AskForm.tsx
│   ├── AnswerPanel.tsx
│   ├── TopArticle.tsx
│   ├── ShareForm.tsx
│   ├── IngestPanel.tsx
│   └── HealthBadge.tsx
├── __tests__/         Vitest specs covering the client + each interactive component
├── App.tsx
├── main.tsx
├── styles.css         All UI styling lives here
└── vite-env.d.ts      Types for VITE_* env vars
```

## Quickstart

### Prerequisites
- Node.js 20+ (the Docker image uses `node:20-alpine`)
- A running backend (see [`pension-ask-us-backend`](https://github.com/Jonathan463/Pension-ask-us-backend)) reachable at
  the URL in `.env.local`

### Local development

```bash
npm install
cp .env.example .env.local        # adjust VITE_API_BASE_URL if needed
npm run dev                       # http://localhost:5173
```

### Tests

```bash
npm test                          # one-shot
npm run test:watch                # watch mode
```

### Production build

```bash
npm run build                     # type-check + Vite production bundle into ./dist
npm run preview                   # serve ./dist locally for a sanity check
```

## Configuration

There is exactly one knob:

| Variable | When read | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Build time** (embedded in the static bundle) | `http://127.0.0.1:8000` | Backend origin used by every API call. |

For dev, drop it in `.env.local`. For production, set it as a build env var
(or `docker build --build-arg`) — there is no runtime override.

## Decoupling guarantees

- **No build-time coupling.** The backend is not a build dependency of this
  project; only its JSON contract is.
- **No deploy-time coupling.** Ship `dist/` to anything — S3+CloudFront,
  Netlify, Vercel, Nginx, GitHub Pages.
- **Stable error contract.** The backend returns
  `{ error, message, details }` on failure; `ApiError` (in `api/client.ts`)
  surfaces those fields to the UI by error code rather than message string.

## Docker

```bash
docker build -t pension-ask-us-web \
  --build-arg VITE_API_BASE_URL=http://localhost:8000 .

docker run --rm -p 8080:80 pension-ask-us-web
```

Multi-stage image: `node:20-alpine` builds, then `nginx:1.27-alpine` serves
the bundle. `nginx.conf` adds an SPA history fallback and immutable
`Cache-Control` for fingerprinted assets.

## Backend

This SPA targets the FastAPI service in
**[`pension-ask-us`](https://github.com/Jonathan463/Pension-ask-us-backend)**. Endpoints used:

- `GET /health` — header status badge
- `POST /ask` — ask form + answer panel
- `POST /ingest` — admin "Run ingest" button
- `POST /share` — email-an-article form

## License

See [`LICENSE`](./LICENSE).
