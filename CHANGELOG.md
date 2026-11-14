# Changelog

Each section lists the changes that reached `main` on that day. Every production deploy is tagged `vYYYY.MM.DD` and published as a GitHub release with its day's section as the notes.

## 2026-11-14

- The site moved from Next.js on Vercel to TanStack Start on Cloudflare Workers, with the same look and the same content. Both languages are prerendered at the edge: English at `/` and Polish at `/pl-PL`, which `/pl` redirects to.
- Faster pages: responsive WebP images in every size the layout needs, and the stylesheet and fonts preloaded with the first response.
- The contact form validates with the same schema in the browser and on the server, limits how often one IP address can send, refuses addresses whose domain cannot receive mail and sends through Cloudflare Email Service.
- `www.pjborowiecki.com` redirects to `pjborowiecki.com`.
- Every pull request deploys to `preview.pjborowiecki.com`, and every production deploy is tagged and released on GitHub.
- Vulnerabilities can be reported privately, as `SECURITY.md` describes.
- The hero portrait shows as soon as it has downloaded, about 1.7 seconds sooner on a mid-range phone, and the pointer-driven light fades in over it instead of the whole scene fading up from dark.
- Every page runs only the scripts its Content-Security-Policy names by hash, checked at build time and in the browser suite.
- The contact form limits each sender as well as each client address, caps the whole site at ten messages a minute, and asks a second DNS resolver before letting through a message whose domain could not be checked.
- The copy now describes what I do today, as a software engineer at IBM, and what I build in my own time. The consultation, offer and pricing sections are gone, the contact form asks only for a name, an email and a message, and ARKA, an open-source booking system, joins the project list.
