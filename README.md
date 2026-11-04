# open-subdomains

[![Registry check](https://github.com/HisokaLabs/open-subdomains/actions/workflows/check.yml/badge.svg)](https://github.com/HisokaLabs/open-subdomains/actions/workflows/check.yml)
[![Zone status](https://github.com/HisokaLabs/is-a.ceo/actions/workflows/health.yml/badge.svg)](https://github.com/HisokaLabs/is-a.ceo/actions/workflows/health.yml)

Get a free subdomain for your project, your portfolio, or your Minecraft
server, so instead of `yourname.github.io` you can have `yourname.is-a.ceo`.

Available domains:

- `is-a.ceo`

More will be added over time.

If you leave the records out entirely, we point your name at GitHub Pages by
default, so `yourname.is-a.ceo` serves `yourname.github.io` the moment your
pull request merges. That is the whole setup for most people.

**[How to claim yours →](CONTRIBUTING.md)** It is a two-minute job: copy one
JSON file, fill in your name, open a PR. Not sure if a name is still free?
Check at [is-a.ceo/check](https://is-a.ceo/check) first.

The registry itself supports multiple zones, so future domains are added as
new entries in the same list.

## How it works

Every claimed subdomain is a small JSON file in the `domains/` folder of this
repository. When your pull request merges, GitHub Actions pushes the DNS to
Cloudflare and your subdomain goes live within a couple of minutes. That is
all there is to it: the repository is the source of truth, no dashboard to
log into, and the pull request you open is your own permanent record of the
claim.

Behind the scenes, the records are managed with
[DNSControl](https://github.com/StackExchange/dnscontrol) and deployed by
[HisokaLabs/dnscontrol-actions@v4](https://github.com/HisokaLabs/dnscontrol-actions).

## Repository guide

This section is for maintainers and anyone curious about the plumbing.
Claiming a subdomain only involves `domains/`.

### How a change flows through

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

### Adding a zone

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

### Credentials

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

### GitHub Actions

| Workflow      | Trigger       | What it does                                                    |
| ------------- | ------------- | --------------------------------------------------------------- |
| `check.yml`   | PR, push main | Validates `domains/`, verifies owners, runs `dnscontrol check`. |
| `preview.yml` | PR            | Runs `dnscontrol preview`, comments the diff on the PR.         |
| `push.yml`    | push main     | Runs `dnscontrol push` against Cloudflare.                      |

The site repository runs `health.yml` every 30 minutes to probe the live zone.

## Claiming a subdomain

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full walkthrough, the record
types you can use, and the rules (one subdomain per person per purpose, no
phishing, and so on).

## Abuse

Report abuse to [abuse@hisoka.net](mailto:abuse@hisoka.net), or read the
policy at [is-a.ceo/abuse](https://is-a.ceo/abuse).

## License

[ISC](LICENSE).
