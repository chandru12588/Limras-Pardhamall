# Limras Frontend

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure API base URL in `.env`:

```env
VITE_API_BASE=http://localhost:8787
```

3. Start backend (from this frontend repo):

```bash
npm run backend
```

4. Start frontend:

```bash
npm run dev
```

## Scripts

- `npm run dev`: run Vite dev server
- `npm run build`: production build
- `npm run lint`: lint project
- `npm run preview`: preview production build
- `npm run backend`: run `limras-backend` service from sibling repo
