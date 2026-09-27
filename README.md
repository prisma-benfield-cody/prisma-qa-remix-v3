# Qa Remix V3

Minimal Remix **3.0.0-rc.3** app wired manually for **Prisma Compute** (Composer). There is no official `create-prisma --template remix` yet.

Live QA deploy: https://t521r8mue4fkh12wbr21qwar.ewr.prisma.build (`cps_t521r8mue4fkh12wbr21qwar`).

## Starter Shape

- `app/actions/controller.tsx` owns the top-level route actions.
- `app/actions/home-page.tsx` and `app/actions/document.tsx` render the route-owned starter UI.
- `app/actions/public/` contains the browser runtime entry and interactive prompt button.
- `app/routes.ts` / `app/router.ts` — route contract + Remix UI renderer.
- `app/assets.ts` — asset pipeline; **`rootDir` pinned via `import.meta.url`** (Compute cwd is outside the uploaded bundle).
- Composer: `module.ts`, `service.ts` (`deps: {}`, `dir: "./.output"`, `entry: "server.ts"`), `prisma-composer.config.ts`.

## Prisma Compute deploy

Platform runtime is **Bun**, not Node. Artifact limit is **256MB** — do not ship full Composer `node_modules`.

```sh
# rebuild slim deploy tree (installs remix + natives into .output/; gitignored)
node scripts/prepare-output.mjs

# deploy (requires prisma auth)
bun run deploy   # → prisma deploy module.ts
```

`.output/` is gitignored (includes `node_modules`). Source fixes + `scripts/prepare-output.mjs` are what to commit.

Working recipe details / failure ladder: see `/workspace/prisma-qa/reports/remix-v3.md` in the QA workspace.

## Local commands

```sh
npm i
npm run dev
npm run hmr
npm run start
npm test
npm run typecheck
```
