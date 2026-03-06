## Cursor Cloud specific instructions

**Product**: OpenReview — an open-source, self-hosted AI code review bot (Next.js 16 + Vercel Workflow + Vercel Sandbox). Single-package app, not a monorepo.

**Package manager**: Bun (`bun@1.3.9`). Lockfile is `bun.lock`.

### Running the dev server

```bash
SKIP_ENV_VALIDATION=1 bun dev
```

`SKIP_ENV_VALIDATION=1` is required when GitHub App credentials are not configured. The server starts on `http://localhost:3000`.

### Lint / format

```bash
bun run check   # lint + format check (ultracite/oxlint/oxfmt)
bun run fix     # auto-fix lint + format issues
```

### Build

```bash
SKIP_ENV_VALIDATION=1 bun run build
```

### Key caveats

- All env vars (GitHub App credentials, etc.) are optional in `lib/env.ts`. Set `SKIP_ENV_VALIDATION=1` to skip validation entirely for local dev without credentials.
- The webhook route (`/api/webhooks`) validates GitHub webhook signatures; unauthenticated POST requests return 401 as expected.
- No database or Docker required. Redis is optional (falls back to in-memory state).
- The `next.config.ts` wraps config with `withWorkflow()` from the `workflow` package, which generates workflow manifests during startup/build (adds ~1-2s to startup).
- See `README.md` for full setup instructions (GitHub App creation, env vars, deployment).
