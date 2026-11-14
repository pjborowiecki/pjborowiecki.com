# pjborowiecki.com

Source code for [pjborowiecki.com](https://pjborowiecki.com), the personal website of Piotr J. Borowiecki. One TanStack Start application, prerendered in English and Polish and served by a Cloudflare Worker, with scroll-driven motion, a WebGL hero and a contact form that sends through Cloudflare Email Service.

The site is small; the engineering around it is held to the standard of production client work. Strict types and lint with no suppressions, a 100% coverage gate, browser tests with an accessibility scan, a preview deployment for every pull request, verified deploys and tagged releases, and performance decisions that were measured before they were made.

[![The pjborowiecki.com landing page: the headline "I build software where small mistakes are expensive", a portrait, three areas of focus and the name set in large type](.github/assets/landing-page.webp)](https://pjborowiecki.com)

The landing page in November 2026.

## Contents

- [Sites and branches](#sites-and-branches)
- [Features](#features)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Project structure and conventions](#project-structure-and-conventions)
- [Problems worth talking about](#problems-worth-talking-about)
- [Engineering standards](#engineering-standards)
- [Commands and verification](#commands-and-verification)
- [Deployment](#deployment)
- [Performance](#performance)
- [Known gaps](#known-gaps)
- [Security](#security)
- [Licence](#licence)

## Sites and branches

| Site                                                         | Deployed from             | Purpose                                            |
| ------------------------------------------------------------ | ------------------------- | -------------------------------------------------- |
| [pjborowiecki.com](https://pjborowiecki.com)                 | `main`, by CI             | Production. `www.pjborowiecki.com` redirects here. |
| [preview.pjborowiecki.com](https://preview.pjborowiecki.com) | Every pull request, by CI | Review of a change, live, before it is merged      |

Work happens on short-lived branches that reach `main` through pull requests. Only production is indexed by search engines; preview sends `noindex, nofollow`.

## Features

- **Two languages.** English at `/` and Polish at `/pl-PL`. `/pl`, `/en` and `/en-US` redirect to their canonical URL with a `308`, and every page carries canonical and `hreflang` links. Every string exists in both locales, which `bun run check` enforces.
- **One composed landing page.** Nine sections, from the hero to the contact form, each reading its own translations and data. A certificate is listed only once it can be checked on the issuer's own record; the rest show in development only.
- **Motion with a reason.** GSAP with ScrollTrigger and SplitText, Lenis as the only smooth scroll, a WebGL shader behind the hero and canvas drawings for the system diagrams. With `prefers-reduced-motion: reduce` the page renders its final state instead of animating.
- **Accessible by construction.** Interactive controls are React Aria components, the skip link moves focus into the main content, the page works from the keyboard alone, and the browser suite runs an axe-core WCAG 2.2 AA scan of both locales at desktop and phone widths.
- **A contact form without API keys.** Name, company, email and message, validated with the same Zod schema in the browser and on the server. It limits each client address, each sender and the site as a whole, refuses domains that cannot receive mail and sends through a Worker binding.

## Technology

| Concern       | Choice                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Framework     | [TanStack Start](https://tanstack.com/start) on React 19, file routes, prerendered pages         |
| Runtime       | [Cloudflare Workers](https://developers.cloudflare.com/workers/) with static assets              |
| Toolchain     | [Vite+](https://viteplus.dev) (`vp`): dev server, build, Vitest, oxlint, oxfmt; Bun scripts      |
| Language      | TypeScript 7 in strict mode with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`     |
| Styling       | Tailwind CSS 4, one stylesheet, `cn` with the project's type tokens                              |
| Components    | React Aria Components through shadcn's `aria-lyra` primitives                                    |
| Motion        | GSAP with ScrollTrigger and SplitText, Lenis as the only smooth scroll, one WebGL hero           |
| Translations  | use-intl, `en-US` by default and `pl-PL` under `/pl-PL`, one JSON file per namespace             |
| Forms         | TanStack Form validated by the same Zod schema as the server function                            |
| Email         | Cloudflare Email Service binding, React Email templates                                          |
| Abuse control | Workers Rate Limiting binding per client address, and an MX lookup over DNS over HTTPS           |
| Tests         | Vitest (node and jsdom projects, coverage gate), Playwright with axe-core in Chromium and WebKit |

## Getting started

### Prerequisites

- [Bun](https://bun.sh) 1.4, the version pinned in `packageManager` in `package.json`.
- Node 26.13.1, pinned in `.nvmrc`; `vp env use` installs it.
- A Cloudflare account, only to send real email from the dev server and to deploy. The test build and the browser suite need none.

### Install and run

```sh
bun install --frozen-lockfile
cp .env.example .env.development
bun run dev
```

Fill in `.env.development` (see [Environment files](#environment-files)), or run `bunx wrangler login` instead. The dev server runs on <http://localhost:3001> with the `development` Worker environment, whose email binding sends through Cloudflare.

### Run the production-like build

```sh
bun run build:test
bun run start:test
bun run test:e2e:pr
```

`build:test` prerenders both locales and builds the Worker for the local `test` environment, `start:test` serves it on port 3001, and `test:e2e:pr` runs the browser suite against it.

## Configuration

### Environment files

The Worker has no secrets: everything it uses is a binding declared in `wrangler.jsonc`. The environment files hold only the credentials that Wrangler itself needs on your machine.

| File               | Committed | Read by                                           |
| ------------------ | --------- | ------------------------------------------------- |
| `.env.example`     | Yes       | Nothing. It lists the variables.                  |
| `.env.development` | No        | `bun run dev`, for the remote email binding       |
| `.env.preview`     | No        | The `wrangler deploy` step of `deploy:preview`    |
| `.env.production`  | No        | The `wrangler deploy` step of `deploy:production` |

| Variable                | Value                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account that owns the Workers and the zone            |
| `CLOUDFLARE_API_TOKEN`  | An API token that can deploy Workers and attach their custom domains |

Every Wrangler environment declares `"secrets": { "required": [] }`. With that declaration Wrangler loads only the listed names into the Worker, so nothing in these files reaches the Worker in development or appears in its generated types. Each script passes its file with `bun --env-file` to the one command that needs it, so the build never sees a token. CI does not use these files: it reads the same two values from GitHub, as described under [Deployment](#deployment).

### Wrangler environments and bindings

| Environment   | Worker                     | Served at                                              | Rate limit namespaces (contact, site-wide) |
| ------------- | -------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| `development` | `pjborowiecki-development` | <http://localhost:3001>, email sent through Cloudflare | `1003`, `1013`                             |
| `test`        | `pjborowiecki-test`        | Local only, for the browser suite                      | `1004`, `1014`                             |
| `preview`     | `pjborowiecki-preview`     | `preview.pjborowiecki.com`                             | `1002`, `1012`                             |
| `production`  | `pjborowiecki`             | `pjborowiecki.com` and `www.pjborowiecki.com`          | `1001`, `1011`                             |

Every environment binds `EMAIL` (`send_email`), `CONTACT_RATE_LIMIT` (`ratelimits`, three messages a minute per client address and per sender) and `CONTACT_GLOBAL_RATE_LIMIT` (ten messages a minute for the whole site). Custom domains are declared as routes with `custom_domain: true`, so a deploy creates their DNS records; the zone holds no records for them otherwise.

### Email

Messages are sent from `hello@pjborowiecki.com` through Cloudflare Email Service, whose return path and DKIM keys live in the zone's DNS. Replies go to the visitor through `Reply-To`. Mail to `hello@pjborowiecki.com` is received by Cloudflare Email Routing.

## Project structure and conventions

```text
.github/             CI, deploy and release workflows, the setup action, Dependabot, assets
.vite-hooks/         Git hooks: staged checks and the commit message emoji
e2e/                 Playwright specs and fixtures (hydration wait, axe-core scan)
messages/<locale>/   One JSON file per translation namespace, in en-US and pl-PL
public/              Fonts, robots.txt and the social image
scripts/             Image optimisation, static headers, build and deployment checks, releases, translation checks
src/
  server.ts          The Worker: redirects, prerendered assets, preload and security headers
  routes/            File routes: the root document and the landing page
  data/              Constants and content data shared by several files
  integrations/      GSAP, use-intl and TanStack Form configuration
  lib/               Server functions, SEO, security headers, release and deployment checks, drawing geometry
  presentation/      Components (custom and shadcn), emails, styles, branding and images
  providers/         Application providers
  platform/testing/  Test helpers and mocks
  types/             Generated Worker types and module declarations
vite.config.ts       Vite, Vitest, oxlint and oxfmt in one file
wrangler.jsonc       Worker environments and bindings
```

Route files compose pages; components read their own translations and data; vendor configuration lives in `src/integrations/<vendor>/`. The conventions follow those of [SaaSy Land](https://saasyland.com/docs/conventions), and [`AGENTS.md`](AGENTS.md) summarises them for this repository.

## Problems worth talking about

### Animation code that must not load on the server

GSAP's ticker schedules a timer as soon as the module is imported, and the Workers runtime forbids timers during module initialisation. Prerendering failed with "Disallowed operation called within global scope" the moment a section imported GSAP. Guarding every import would have spread the problem across every animated section. Instead, [`scripts/server-motion.ts`](scripts/server-motion.ts) is a Vite plugin that resolves `~/src/integrations/gsap/gsap.config` to [`gsap.server.ts`](src/integrations/gsap/gsap.server.ts), a module of inert stand-ins, in the `ssr` environment only. Components import motion from one place, the client gets the real library, and the Worker contains no GSAP at all.

### Pages that paint before JavaScript

Both locales are prerendered at build time and served as static assets; [`src/server.ts`](src/server.ts) imports the TanStack Start handler only for requests that have no prerendered page, so a page request never evaluates the full server bundle. TanStack Start adds a `modulepreload` hint for every chunk a route depends on, which the browser fetches ahead of the stylesheet and fonts; [`scripts/optimize-prerendered-html.ts`](scripts/optimize-prerendered-html.ts) removes those hints. The Worker then sends a `Link` header for the stylesheet and the font subsets of the page's language, which Cloudflare also sends ahead of the page as `103 Early Hints`: English preloads the Latin subsets, Polish adds Latin Extended. [`scripts/deployed-worker.ts`](scripts/deployed-worker.ts) rebuilds the Worker after prerendering without the translations that only the prerendered page needs.

The hero portrait never waits for JavaScript. It is a plain image, preloaded at high priority, that paints the moment it arrives; the WebGL scene with the pointer-driven light crossfades in over it once it is ready, already fully lit. An earlier version hid the image until the scene had started and then faded the light up, which on a mid-range phone kept a downloaded portrait invisible for 1.6 seconds and dark for 2.4 more.

### Images: measured, not assumed

AVIF files were smaller than WebP, so the first pipeline used them. Measured in Chrome, they made the browser decode while scrolling and caused occasional frames of 160 to 640 ms; the same page with WebP stayed under 100 ms. The pipeline now writes only WebP: `bun run images` turns each master in `src/presentation/assets/images/originals` into variants at widths up to the master's own, [`src/data/images.ts`](src/data/images.ts) reads them into typed source sets, and Vite fingerprints them so they are cached for a year.

### A contact form with no API keys

[`src/lib/contact.ts`](src/lib/contact.ts) holds the Zod schema, the server function and its mutation options; the form validates with the same schema on every change and on submit. On the Worker, the function:

1. rate limits the client address and the sender's email address with the `CONTACT_RATE_LIMIT` binding, so changing either alone does not help, and caps the whole site at ten messages a minute with `CONTACT_GLOBAL_RATE_LIMIT`;
2. refuses an address whose domain does not exist or publishes only a null MX ([RFC 7505](https://www.rfc-editor.org/rfc/rfc7505)), asking Cloudflare's DNS over HTTPS and then Google's when the first fails or answers with an error. A domain without an MX record is accepted, because mail then goes to its address record ([RFC 5321](https://www.rfc-editor.org/rfc/rfc5321#section-5.1)). Only when neither resolver answers does the message go through unchecked, because losing a real enquiry to a DNS outage costs more than one undeliverable reply, and the email then says the domain could not be checked;
3. renders [`contact-email.tsx`](src/presentation/emails/contact-email.tsx) in the visitor's language and sends it through the `EMAIL` binding, with the visitor as the reply-to address.

Both bindings are declared in `wrangler.jsonc`, so there is no key to rotate or leak.

### Browser tests that wait for hydration

A prerendered page looks interactive before React has attached its handlers. On slow CI runners, the browser suite clicked buttons in that window and the clicks were lost, so specs failed only in CI. The failure was reproduced locally with 10 to 20 times CPU throttling, and [`e2e/fixtures/hydration.ts`](e2e/fixtures/hydration.ts) now waits until every button and React Aria element carries React's props before a spec acts.

## Engineering standards

oxlint checks the source, the scripts and the browser specs, with six categories as errors: `correctness`, `nursery`, `pedantic`, `perf`, `style` and `suspicious`, with type-aware rules and type checking. Files are limited to 800 lines, functions to 150 lines and 20 statements; `no-magic-numbers` allows only `0`, and `id-length` allows only `_`, `m` and `t`.

```jsonc
"strict": true,
"exactOptionalPropertyTypes": true,
"noUncheckedIndexedAccess": true,
"noPropertyAccessFromIndexSignature": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true
```

The hand-written code has no comments, no lint suppressions, no `@ts-expect-error`, no `as` casts, no `any`, and `null` only where React or a platform API produces it; domain values are named constants. oxfmt formats at 140 columns without semicolons and sorts Tailwind classes in `cn`, `cva`, `clsx` and `tw`. Git hooks in [`.vite-hooks/`](.vite-hooks) check translations and staged files before each commit and prefix each conventional commit message with its type's emoji.

The coverage gate is 100% of lines, statements, functions and branches for the Worker, the routes, the integrations, the data, the library code, the contact form and the smaller components. The files that depend on layout, scrolling or WebGL are listed in `BROWSER_VERIFIED` in [`vite.config.ts`](vite.config.ts) and covered by the browser suite instead: the hero scene, the system diagrams, the navigation and mobile menu, the landing sections, the case-study panel and the project index. The generated shadcn primitives are excluded too.

## Commands and verification

| Script                                                      | What it does                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| `bun run dev`                                               | Dev server with the `development` Worker environment                   |
| `bun run check`                                             | Translations, formatting, lint and types                               |
| `bun run test` / `bun run test:coverage`                    | Unit and component tests, the second with the coverage gate            |
| `bun run build:test` / `build:preview` / `build:production` | Prerender, build the Worker for that environment and verify the output |
| `bun run start:test`                                        | Serve the test build locally on port 3001                              |
| `bun run test:e2e:pr`                                       | The browser suite in Chromium against the test build                   |
| `bun run test:e2e`                                          | The browser suite in Chromium and WebKit                               |
| `bun run deploy:preview` / `deploy:production`              | Build, deploy and check the live Worker of that environment            |
| `bun run images`                                            | Regenerate the responsive image variants                               |
| `bun run typegen`                                           | Regenerate the Worker binding types and the class tables               |
| `bun run skills:sync`                                       | Install the agent skills pinned in `skills-lock.json`                  |

A change is done when `bun run check`, `bun run test:coverage`, `bun run build:test` and `bun run test:e2e:pr` all pass, in that order. What each gate covers:

- **Translations.** [`scripts/check-i18n.ts`](scripts/check-i18n.ts) fails when a key exists in one locale only or when a `t("key")` call does not resolve; [`scripts/check-message-formats.ts`](scripts/check-message-formats.ts) fails when a translation changes ICU arguments or tags.
- **Unit and component tests.** Vitest in a node project for the Worker, server functions and scripts' libraries, and a jsdom project for components.
- **Browser suite.** Playwright drives the built Worker in both locales: the language redirects, navigation, the mobile menu, the contact form and an axe-core WCAG 2.2 AA scan.
- **Build verification.** [`scripts/verify-build.ts`](scripts/verify-build.ts) checks that both locales were prerendered with the right `lang`, canonical and alternate links, that the fonts are in place and that no server-only module reached the client.

## Deployment

### Automatic GitHub deployments

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull request and every push to `main`:

| Job                              | Runs on                            | What it does                                                           |
| -------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Format, lint, types, i18n, tests | Pull requests and `main`           | `bun run check` and `bun run test:coverage`                            |
| Build and E2E (Chromium)         | Pull requests and `main`           | `bun run build:test` and the browser suite                             |
| Deploy preview                   | Pull requests from this repository | Builds, deploys to `preview.pjborowiecki.com` and checks the live site |
| Deploy production                | Pushes to `main`                   | Builds, deploys to `pjborowiecki.com` and checks the live site         |
| Release                          | After a production deploy succeeds | Tags the commit and publishes a GitHub release                         |

[`e2e-full.yml`](.github/workflows/e2e-full.yml) adds WebKit on every push to `main` and runs both browsers weekly and on demand. Deploys read `CLOUDFLARE_API_TOKEN` from the GitHub `Preview` and `Production` environments and `CLOUDFLARE_ACCOUNT_ID` from the repository variables. Pull requests from forks and from Dependabot are checked but not deployed, because GitHub gives them no secrets; their preview deploy reports as skipped, which the merge rules accept. Every deploy ends with [`scripts/verify-deployment.ts`](scripts/verify-deployment.ts), which fails the job unless the live Worker answers both locales and `robots.txt`.

### Releases

The `release` job tags the deployed commit `vYYYY.MM.DD` with the UTC date (`.2`, `.3` and so on for later deploys that day) and publishes a GitHub release whose notes are that day's section of [`CHANGELOG.md`](CHANGELOG.md). It is the only job with `contents: write`, and preview deploys are never tagged.

### Repository rules

- `main` accepts changes only through pull requests, merged by squash or rebase into a linear history. A pull request needs both CI checks above, its preview deploy, GitGuardian's secret scan and CodeRabbit's review to pass, and GitHub Copilot reviews every push. `main` cannot be deleted or force-pushed.
- `v*` release tags cannot be deleted or moved.
- Only `main` can deploy to the GitHub `Production` environment or use the deploy token stored in it.
- Secret scanning with push protection, CodeQL and Dependabot alerts are on.

### Manual deployment

`bun run deploy:preview` and `bun run deploy:production` build, deploy and check an environment from a local checkout, with the credentials in `.env.preview` or `.env.production`. Production is normally deployed only by merging to `main`.

## Performance

Lighthouse 13.6.0, median of five runs on 14 November 2026: this site at `preview.pjborowiecki.com`, served by the same Worker build as production, against the previous Next.js build on Vercel, measured the same day.

| Metric                   | Mobile, Next.js | Mobile, this site | Desktop, Next.js | Desktop, this site |
| ------------------------ | --------------- | ----------------- | ---------------- | ------------------ |
| Performance score        | 63              | **94**            | 93               | **100**            |
| First Contentful Paint   | 1.2 s           | **0.96 s**        | 0.34 s           | 0.32 s             |
| Largest Contentful Paint | 5.2 s           | **1.5 s**         | 1.0 s            | **0.52 s**         |
| Total Blocking Time      | 580 ms          | **275 ms**        | 179 ms           | **18 ms**          |
| Cumulative Layout Shift  | 0               | 0                 | 0                | 0                  |
| Speed Index              | 4.5 s           | **1.8 s**         | 1.1 s            | **0.63 s**         |
| Page weight              | 1.6 MB          | **1.1 MB**        | 1.8 MB           | **1.2 MB**         |

The Largest Contentful Paint is the portrait. Before the portrait stopped waiting for the WebGL scene, it was hidden while the page loaded, so Lighthouse measured the headline instead and reported 1.1 s while the portrait itself appeared about 1.7 s later; showing it at once raised the measured value and brought the Speed Index from 2.7 s to 1.8 s.

Mobile is Lighthouse's emulated Moto G Power on slow 4G. These are lab results on one machine, so scores vary between runs; compare several runs before judging a change. [Run PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fpjborowiecki.com%2F) for current results.

The decisions behind these numbers are described in [Problems worth talking about](#problems-worth-talking-about). Review them before changing images, fonts, motion or the Worker, and compare production builds before and after.

## Known gaps

Kept here rather than hidden, because an accurate map is more useful than a flattering one.

- Mobile Total Blocking Time is about 275 ms in the lab. Hydration evaluates roughly 950 KB of minified JavaScript at once: the framework, the landing route, the animation libraries and the class tables. Starting the WebGL scene later made no measurable difference, so the next step is splitting the sections below the fold and the contact form into chunks that load and hydrate after the first paint.
- The navigation, the mobile menu, the landing sections, the case-study panel and the project index are outside the unit coverage gate along with the scroll choreography, the WebGL hero and the canvas drawings. The browser suite exercises all of them, but asserts behaviour, not frames, and their non-visual logic deserves unit tests of its own.
- Cloudflare API tokens cannot be limited to one Worker, so the deploy token can reach both Workers. Only `main` can deploy to the GitHub `Production` environment, but the `Preview` environment holds the same token, so a workflow on any branch of this repository could reach production. Only the owner can push branches, and pull requests from forks and Dependabot get no secrets.

## Security

Report vulnerabilities privately, as described in [`SECURITY.md`](SECURITY.md).

Every script a page runs is allowed by name. TanStack Start writes its hydration data into each page as inline scripts, so a `script-src` policy needs their hashes: [`scripts/optimize-prerendered-html.ts`](scripts/optimize-prerendered-html.ts) hashes the inline scripts of every prerendered page and embeds the policy before the first of them, [`src/server.ts`](src/server.ts) does the same in a header for pages it renders on request, and both use [`src/lib/content-security-policy.ts`](src/lib/content-security-policy.ts). `verify-build.ts` fails a build whose embedded policy does not match its scripts, and the browser suite fails on any policy violation. Zod runs in `jitless` mode, so it never probes for `eval`.

The Worker sends `Content-Security-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options` and, over HTTPS, `Strict-Transport-Security` on every response. Static files can be served without the Worker, so [`scripts/write-static-headers.ts`](scripts/write-static-headers.ts) writes the same headers and the cache rules into `_headers` at build time from [`src/data/http.ts`](src/data/http.ts), the one place both read them from, and `verify-build.ts` fails a build whose `_headers` differs.

## Licence

[MIT](LICENSE.md)
