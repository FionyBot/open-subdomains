# Pull request, `*.is-a.ceo`

Thanks for claiming a subdomain. Keep this PR to **one subdomain per file** and
the filename must be `<subdomain>.<zone>.json` (for example `mc.is-a.ceo.json`).

## What this PR does

<!-- e.g. adds mc.is-a.ceo for my Minecraft server -->

- [ ] I added **one** file under `domains/`, named `<subdomain>.<zone>.json`.
- [ ] I did **not** edit `dnsconfig.js` by hand, subdomains are added via `domains/*.json` only.
- [ ] I did **not** edit someone else's file.
- [ ] I am not squatting, hoarding, or impersonating a brand or another person.
- [ ] The content hosted here will be legal in the Netherlands and will not be
      malware, phishing, or abuse-related.

## The entry

```json
{
  "domain": "is-a.ceo",
  "subdomain": "your-subdomain",
  "owner": "your-github-username"
}
```

Full field list, subdomain shapes, and record examples: [CONTRIBUTING.md](CONTRIBUTING.md) ·
Schema: [domains/SCHEMA.json](domains/SCHEMA.json)

---

_A maintainer reviews every PR. The DNS preview is posted as a comment below.
Once merged, the zone is pushed to Cloudflare within a minute or two._
