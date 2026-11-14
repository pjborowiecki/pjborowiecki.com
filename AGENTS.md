# AGENTS.md

pjborowiecki.com is the personal site of Piotr J. Borowiecki: one TanStack Start (React 19) application running as a Cloudflare Worker, with its public pages prerendered, use-intl in English and Polish, GSAP and Lenis for motion, and a contact form that sends through the Cloudflare Email Service binding behind the Workers rate limiter. Bun is the package manager and script runner; Vite+ (`vp`) runs the dev server, builds, Vitest, oxlint and oxfmt from `vite.config.ts`.

The conventions follow those of [SaaSy Land](https://github.com/saasyland/saasyland.com), documented at <https://saasyland.com/docs/conventions>. This file is the summary for this repository.

## Commands

```sh
bun install --frozen-lockfile
bun run dev
bun run check
bun run test:coverage
bun run build:test
bun run test:e2e:pr
```

Run tests with `bun run test`, never `bun test`. Format and lint only the files you changed with `bunx vp fmt <files>` and `bunx vp lint --fix <files>`; never run `bun run check:fix` or `vp check --fix` over the repository. The formatter keeps `package.json` scripts sorted by name, and `vp check` fails when one is out of order. `bun run images` regenerates the responsive image variants after a master in `src/presentation/assets/images/originals` changes.

## Definition of done

`bun run check`, `bun run test:coverage`, `bun run build:test` and `bun run test:e2e:pr`, in that order, all exit 0 on the branch you are about to push. A documentation-only change may skip the browser suite, not the build. Nothing else counts as done, including a summary that says it is.

## Where code goes

- `src/routes/`: route files that compose pages, with `NAMESPACE`, one `Promise.all` loader and `pageHead`. Copy `src/routes/_landing.index.tsx`.
- `src/presentation/components/custom/`: one component per file; landing sections in `landing-page/sections/`, their parts in `landing-page/components/`; components read their own translations and data.
- `src/presentation/components/shadcn/`: React Aria shadcn primitives of the `aria-lyra` style, added with the shadcn CLI and imported directly.
- `src/integrations/<vendor>/`: vendor configuration. `src/lib/`: utilities and server functions. `src/data/`: data and constants several files share.
- `messages/<locale>/<namespace>.json`: every string in `en-US` and `pl-PL`.

## Rules without exceptions

1. No comments anywhere: code, tests, scripts, configuration, CSS.
2. No `oxlint-disable`, `eslint-disable`, `@ts-expect-error`, `@ts-ignore`, `as` casts or `any` to get past a rule. Fix the cause.
3. No multi-line ternaries; conditional classes use `cn("base", { "classes": condition })` from `~/src/lib/cn`.
4. No `?? undefined` and no `null` literals (React's `useRef(null)` is the one allowed form); validate with Zod instead.
5. Kinds, statuses and other domain values are named constants (`CONTACT_ERROR.RATE_LIMITED`), never repeated string literals, in tests too. Numbers other than `0` are named constants.
6. Server functions validate their input with a Zod schema that the form validates with too (`contactFormSchema` in `src/lib/contact.ts`).
7. Every user-facing string exists in both locales; `bun run check:i18n` fails otherwise.
8. Coverage stays at 100% for lines, statements, functions and branches of the code the gate includes; delete unreachable branches instead of stubbing them.
9. A change updates the README and the site copy it makes inaccurate.
10. Commits are conventional (`fix(contact): keep the locale in the enquiry email`), never `--no-verify`, and carry no `Co-Authored-By` trailer or any other AI attribution; the same goes for pull request descriptions. Do not type the emoji: the hook adds it from the type (`feat` ✨, `fix` 🐛, `docs` 📚, `refactor` 📦, `chore` ♻️, `test` 🚨, `perf` 🚀, `build` 🛠️, `ci` ⚙️, `style` 💎, `revert` 🗑️).
11. Stay on the latest dependency versions: adapt the code, or carry an upstream bug as a `bun patch` and report it upstream. Never pin back.
12. Performance is measured, not assumed: compare production builds before and after a change to motion, images or the Worker.

## Branches and deployments

Work on a short-lived branch and open a pull request against `main`. CI deploys every pull request to `preview.pjborowiecki.com`; merging it deploys `pjborowiecki.com`.

## Human review required

Do not change these without a person's explicit go-ahead in the task:

- `wrangler.jsonc`, `.github/workflows/` and anything that reads a secret or a binding.
- The production deployment of `pjborowiecki.com` and the `main` branch.

Never deploy production or change secrets (`wrangler deploy --env production`, `wrangler secret`); those are human steps.

## Current library documentation

The framework versions here are newer than most training data. Read the installed documentation before using an API:

- Vite+: `node_modules/vite-plus/docs`.
- TanStack Start and Router ship agent skills inside their packages: `node_modules/@tanstack/react-start/skills`, `node_modules/@tanstack/react-router/skills`.
- Vendor skills for Cloudflare, GSAP, TanStack and others are pinned in `skills-lock.json`; `bun run skills:sync` installs them into `.agents/skills` and links them into `.claude/skills`.
