# register

[![Registry check](https://github.com/HisokaLabs/open-subdomains/actions/workflows/check.yml/badge.svg)](https://github.com/HisokaLabs/open-subdomains/actions/workflows/check.yml)
[![Zone status](https://github.com/HisokaLabs/is-a.ceo/actions/workflows/health.yml/badge.svg)](https://github.com/HisokaLabs/is-a.ceo/actions/workflows/health.yml)

A multi-zone free-subdomain registry, starting with `is-a.ceo`. The public
website lives in [HisokaLabs/is-a.ceo](https://github.com/HisokaLabs/is-a.ceo).

The zones are managed with [DNSControl](https://github.com/StackExchange/dnscontrol)
and deployed by
[HisokaLabs/dnscontrol-actions@v4](https://github.com/HisokaLabs/dnscontrol-actions).

## How it fits together

```
domains/*.json ──> dnsconfig.js (loaded at runtime) ──> dnscontrol push ──> Cloudflare
```

`domains/` is the only place anyone edits. `dnsconfig.js` reads those files
when DNSControl runs, nothing is generated. The managed zones are listed in
`domains/_meta.json` (`zones`) — the validator rejects any entry naming a
zone outside that list, so a stray or typoed zone can never reach the
`dnscontrol push` stage and break the other zones' deployment.

| Path                       | What it is                                                         |
| -------------------------- | ------------------------------------------------------------------ |
| `domains/*.json`           | One file per record, named `<subdomain>.<zone>.json`. The registry. |
| `domains/_meta.json`       | Reserved and blocked names, length limits.                          |
| `domains/_example.json`    | Copy-paste template for a new entry.                                |
| `domains/SCHEMA.json`      | JSON Schema for an entry. Editor autocomplete.                      |
| `dnsconfig.js`             | Loads `domains/*.json` at runtime and declares one zone per entry.  |
| `scripts/validate.js`      | The strict validator. Fails CI on any rule violation.               |
| `scripts/verify-owners.js` | PR-author check. Owner must match the claimant.                     |
| `.github/workflows/`       | check, preview, push.                                               |

The registry ships with two infrastructure entries, `@.is-a.ceo.json` (zone
apex, the website's GitHub Pages records) and `www.is-a.ceo.json`. Zone apex
records are ordinary entries here, not a separate config.

## Adding a zone

1. Add the zone to the same Cloudflare account and make sure the
   `CLOUDFLARE_API_TOKEN` secret can edit its DNS.
2. Add the zone name to `zones` in `domains/_meta.json` (and, if you are not
   the PR author, to `maintainers` — that list also gates zone-wide `*`
   wildcards).
3. Commit its infrastructure entries: `@.<zone>.json` (apex) and any others
   the zone needs, for example `www.<zone>.json`.

Every zone in the data is declared automatically. The validator refuses
entries for zones that are not in the list, which keeps typos out before
anything merges.

## Credentials

`creds.json` is committed and contains only an indirection:

```json
{
  "cloudflare": {
    "TYPE": "CLOUDFLAREAPI",
    "apitoken": "$CLOUDFLARE_API_TOKEN"
  }
}
```

DNSControl expands `$CLOUDFLARE_API_TOKEN` from the environment, so no secret
ever lands in this repository. GitHub Actions injects the real token as the
`CLOUDFLARE_API_TOKEN` repository secret, scoped to `Zone.DNS` edit on every
zone this registry manages.

## GitHub Actions

| Workflow      | Trigger       | What it do                                                      |
| ------------- | ------------- | --------------------------------------------------------------- |
| `check.yml`   | PR, push main | Validates `domains/`, verifies owners, runs `dnscontrol check`. |
| `preview.yml` | PR            | Runs `dnscontrol preview`, comments the diff on the PR.         |
| `push.yml`    | push main     | Runs `dnscontrol push` against Cloudflare.                      |

The site repository runs `health.yml` every 30 minutes to probe the live zone.

## Adding a subdomain

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: copy
`domains/_example.json` to `domains/<your-subdomain>.<zone>.json`, fill it in,
open a PR, a bot shows you the DNS change, merge, done.

## License

[ISC](LICENSE).
