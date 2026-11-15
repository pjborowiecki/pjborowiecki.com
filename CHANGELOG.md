# Changelog

Each section lists the changes that reached `main` on that day. Every production deploy is tagged `vYYYY.MM.DD` and published as a GitHub release with its day's section as the notes.

## 2026-11-15

- Opening the mobile menu, or scrolling down, rolls the header's initials into the full name instead of crossfading the two on top of each other.
- The hero keeps its proportions on every window shape. Its portrait, text and spacing scale together from one unit, so a narrower or squarer window shows the same composition smaller instead of the text drifting up and away from a towering portrait, and an ultrawide window centres it instead of stretching the name and text to the edges.
- Resizing the window no longer makes the hero portrait flash or disappear. The WebGL scene redraws in the same frame it is resized instead of showing a cleared canvas, and it is no longer torn down and rebuilt when the window crosses the height at which the hero pins.
- The hero portrait dissolves into the background on every screen shape. On windows only slightly wider than they are tall, its bottom edge used to stop short of the fade and show as a hard line.
- On screens too short to hold them, such as a phone held sideways, the hero and the expertise cards scroll as ordinary content instead of pinning. The hero's headline and buttons used to fade away before they could scroll into view, and the cards cut off their last line.

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
- Dependabot's updates can merge: the preview deploy they skip, because they get no secrets, now reports as skipped instead of blocking them.
- The copy now describes what I do today, as a software engineer at IBM, and what I build in my own time. The consultation, offer and pricing sections are gone, the contact form asks only for a name, an email and a message, and ARKA, an open-source booking system, joins the project list.
- Keyboard and screen reader fixes: the skip link moves focus into the main content, the footer is the page's own landmark instead of part of the contact section, the error page announces only its message, a form field points to its error only while it has one, and the location label in the about section meets the contrast minimum. The accessibility scan now also runs at phone width.
- While the mobile menu is open, the footer and the skip link are inert along with the main content, so the keyboard cannot reach links hidden behind the menu.
- Certificates that cannot be checked on the issuer's record yet appear only in development, no longer on the preview site.
- The contact form accepts a domain without an MX record, which receives mail at its address record, and still refuses one that does not exist or publishes a null MX.
- The site no longer sets a language cookie; the URL alone carries the language.
- Security headers and cache rules have one definition, which the Worker reads and the build writes into `_headers` for static files.
- Colours, media queries, page ids and number formats are each defined once, and the navigation closes its mobile menu at the same breakpoint, measured in rem, as the classes that hide it.
