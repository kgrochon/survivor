# Survivor Season 50

Standalone React/Vite microsite (`npm run dev` / `npm run build → dist`).

### Development

Requires Node ≥ 22.13 (see `.nvmrc`).

| Script                 | Purpose                          |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the Vite dev server        |
| `npm run build`        | Type-check and build to `dist/`  |
| `npm run typecheck`    | Type-check only (`tsc -b`)       |
| `npm run lint`         | Lint with ESLint                 |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |

### GitHub Pages

1. **Settings → Pages → Build and deployment**, set source to **GitHub Actions**.
2. Push `main`; workflow **Deploy to GitHub Pages** publishes to `https://kgrochon.github.io/survivor/` (uses `vite` base `/survivor/`).  
   If you rename the repo, update **`vite.config.ts`** (`base` path) and the portfolio **`VITE_SURVIVOR_APP_URL`** accordingly.

### Vercel / custom domain

Use **`vercel.json`** as-is (**`base`** stays **`/`**). Connect the repo or run **`npm run build`** locally without `VITE_BASE` (SPA at domain root).
