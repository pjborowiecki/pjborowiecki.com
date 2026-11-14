# Changelog

Each section lists the changes that reached `main` on that day. Every production deploy is tagged `vYYYY.MM.DD` and published as a GitHub release with its day's section as the notes.

## 2026-11-14

- The site moved from Next.js on Vercel to TanStack Start on Cloudflare Workers, with the same look and the same content. Both languages are prerendered at the edge: English at `/` and Polish at `/pl-PL`, which `/pl` redirects to.
- Faster pages: responsive WebP images in every size the layout needs, and the stylesheet and fonts preloaded with the first response.
- The contact form validates with the same schema in the browser and on the server, limits how often one IP address can send, refuses addresses whose domain cannot receive mail and sends through Cloudflare Email Service.
- `www.pjborowiecki.com` redirects to `pjborowiecki.com`.
- Every pull request deploys to `preview.pjborowiecki.com`, and every production deploy is tagged and released on GitHub.
