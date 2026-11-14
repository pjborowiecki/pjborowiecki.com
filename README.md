# pjborowiecki.com

The personal site of Piotr J. Borowiecki: software delivery, system architecture and production AI for companies that cannot afford to get it wrong. It runs on Cloudflare Workers, in English at [pjborowiecki.com](https://pjborowiecki.com) and in Polish at [pjborowiecki.com/pl-PL](https://pjborowiecki.com/pl-PL).

## Stack

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

## How a request is served

`src/server.ts` is the Worker. For every `GET` and `HEAD` it first asks the static assets for a prerendered page, and only renders with TanStack Start when there is none. On the way out it:

- redirects language aliases (`/pl`, `/en`, `/en-US`) to their canonical URL with a `308`;
- remembers the visitor's locale in a cookie;
- adds `Link` preload headers for the stylesheet and the font subsets of the page's language;
- sends baseline security headers (`Content-Security-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, and `Strict-Transport-Security` over HTTPS). `public/_headers` gives files served without the Worker the same protection and long-lived caching for hashed assets and fonts.

Both locales of the landing page are prerendered at build time, so they need no JavaScript to paint. `scripts/optimize-prerendered-html.ts` strips TanStack Start's dependency `modulepreload` hints from the prerendered HTML, so the stylesheet and fonts load first, and `scripts/deployed-worker.ts` leaves the prerendered page's translations out of the deployed Worker. The Worker keeps only what it still needs at runtime: the error pages, the locale middleware and the contact server function.

## The contact form

`src/lib/contact.ts` holds the Zod schema, the server function and its mutation options. The form in `src/presentation/components/custom/landing-page/components/contact-form.tsx` validates with the same schema on every change and on submit. On the Worker, the function:

1. rate limits the client address with the `CONTACT_RATE_LIMIT` binding;
2. refuses an address whose domain publishes no mail exchanger, or a null MX, using Cloudflare's DNS over HTTPS (a failed lookup lets the enquiry through);
3. renders `src/presentation/emails/contact-email.tsx` in the visitor's language and sends it through the `EMAIL` binding, with the visitor as the reply-to address.

No API key or secret is involved: both bindings are declared in `wrangler.jsonc`.

## Images

Masters live in `src/presentation/assets/images/originals`. `bun run images` writes AVIF and WebP variants at widths up to each master's own into `src/presentation/assets/images/optimized`, named `<name>-<width>x<height>.<format>`. `src/data/images.ts` reads them into typed source sets, and `ResponsiveImage` renders a `<picture>` with both formats, intrinsic dimensions, lazy loading by default and high fetch priority for the hero. Vite fingerprints every variant, so they are cached for a year.

## Getting started

Requirements: [Bun](https://bun.sh) 1.4 (the version is pinned in `package.json`) and Node 26.13.1 (pinned in `.nvmrc`; `vp env use` installs it).

```sh
bun install --frozen-lockfile
bun run dev
```

The dev server runs on <http://localhost:3001> with the `development` Worker environment, whose email binding sends through Cloudflare. Run `bunx wrangler login` once so it can.

## Scripts

| Script                                                      | What it does                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| `bun run dev`                                               | Dev server with the `development` Worker environment                   |
| `bun run check`                                             | Translations, formatting, lint and types                               |
| `bun run test` / `bun run test:coverage`                    | Unit and component tests, the second with the coverage gate            |
| `bun run build:test` / `build:preview` / `build:production` | Prerender, build the Worker for that environment and verify the output |
| `bun run start:test`                                        | Serve the test build locally on port 3001                              |
| `bun run test:e2e:pr`                                       | The browser suite in Chromium against the test build                   |
| `bun run deploy:preview`                                    | Build, deploy and check `preview.pjborowiecki.com`                     |
| `bun run images`                                            | Regenerate the responsive image variants                               |
| `bun run typegen`                                           | Regenerate the Worker binding types and the class tables               |
| `bun run skills:sync`                                       | Install the agent skills pinned in `skills-lock.json`                  |

## Quality gates

A change is done when `bun run check`, `bun run test:coverage`, `bun run build:test` and `bun run test:e2e:pr` all pass, in that order.

- **Lint and format.** oxlint runs the correctness, nursery, pedantic, perf, style and suspicious categories as errors with type-aware rules. There are no comments, no `as` casts, no `any`, no `null` literals and no lint suppressions anywhere in the code.
- **Translations.** `scripts/check-i18n.ts` fails when a key exists in one locale only or when a `t("key")` call does not resolve; `scripts/check-message-formats.ts` fails when a translation changes ICU arguments or tags.
- **Unit and component tests.** The coverage gate is 100% of lines, statements, functions and branches for the server, the routes, the integrations, the data, the library code and the interactive components. Scroll choreography, the WebGL hero and the canvas drawings cannot run in jsdom, so the browser suite covers them instead.
- **Browser suite.** Playwright drives the built Worker: both locales, the language redirects, navigation, the mobile menu, the contact form and an axe-core WCAG 2.2 AA scan of both locales.
- **Build verification.** `scripts/verify-build.ts` checks that both locales were prerendered with the right `lang`, canonical and alternate links, that fonts are in place and that no server-only module reached the client.

## Deployment

`wrangler.jsonc` declares four environments: `development`, `test`, `preview` (`preview.pjborowiecki.com`) and `production` (`pjborowiecki.com`).

- `bun run deploy:preview` builds, deploys and then checks that the live Worker answers both locales and `robots.txt`.
- CI (`.github/workflows/ci.yml`) verifies every pull request and push, runs the browser suite, deploys `preview` on a push to the `preview` branch and `production` on a push to `main`. Deploying from CI needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the GitHub `Preview` and `Production` environments.
- Pages other than production send `noindex, nofollow`, so previews stay out of search results.

## Conventions

The code follows the conventions of [SaaSy Land](https://saasyland.com/docs/conventions). `AGENTS.md` summarises them for this repository.

## Licence

[MIT](LICENSE.md)
