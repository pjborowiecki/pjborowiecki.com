# Security policy

## Supported versions

| Version                                                                                | Supported |
| -------------------------------------------------------------------------------------- | --------- |
| [pjborowiecki.com](https://pjborowiecki.com) and `main`                                | Yes       |
| [preview.pjborowiecki.com](https://preview.pjborowiecki.com)                           | Yes       |
| [new.pjborowiecki.com](https://new.pjborowiecki.com), a frozen copy of earlier content | Yes       |
| Earlier releases and commits                                                           | No        |

Merges to `main` deploy to pjborowiecki.com once CI passes, so a fix reaches the site with the next release.

## Reporting a vulnerability

Do not report vulnerabilities in public issues, pull requests or comments. Report them privately with GitHub's [private vulnerability reporting](https://github.com/pjborowiecki/pjborowiecki.com/security/advisories/new), or by email to hello@pjborowiecki.com.

Include:

- what is affected: a URL, a server function or a file;
- the steps to reproduce it, or a proof of concept;
- the impact: what an attacker can read, change or do.

## What to expect

These are targets, not guarantees:

- an acknowledgement within three working days;
- an assessment within ten working days, with a plan for a fix if the issue is confirmed;
- updates until the fix is deployed, then a GitHub security advisory that credits you, unless you prefer not to be named.

Please allow reasonable time to fix a confirmed issue before you disclose it.

## Scope

In scope: the three sites above, including the contact form, and the code in this repository.

Out of scope: vulnerabilities in third-party services such as Cloudflare and GitHub, unless this repository's configuration causes them, and scanner output without a demonstrated impact.
