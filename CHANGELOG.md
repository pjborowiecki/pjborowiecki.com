# Changelog

Each section lists the changes that reached `main` on that day. Every production deploy is tagged `vYYYY.MM.DD` and published as a GitHub release with its day's section as the notes.

## 2026-11-14

- The site moved from Next.js on Vercel to TanStack Start on Cloudflare Workers, with the same look and the same content. Both languages are prerendered at the edge: English at `/` and Polish at `/pl-PL`, which `/pl` redirects to.
- Faster pages: responsive WebP images in every size the layout needs, and the stylesheet and fonts preloaded with the first response.
- The contact form validates with the same schema in the browser and on the server, limits how often one IP address can send, refuses addresses whose domain cannot receive mail and sends through Cloudflare Email Service.
- `www.pjborowiecki.com` redirects to `pjborowiecki.com`.
- Every pull request deploys to `preview.pjborowiecki.com`, and every production deploy is tagged and released on GitHub.
- The site's content as of today stays online at `new.pjborowiecki.com`, for reference.
- Vulnerabilities can be reported privately, as `SECURITY.md` describes.
- The copy now describes what I do today, as a software engineer at IBM, and what I build in my own time. The consultation, offer and pricing sections are gone, the contact form asks only for a name, an email and a message, and ARKA, an open-source booking system, joins the project list.
