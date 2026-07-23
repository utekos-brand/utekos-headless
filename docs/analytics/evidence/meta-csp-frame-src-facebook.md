# Evidence — Meta Pixel CSP report-only `frame-src` for `www.facebook.com`

```text
Captured: 2026-07-24
Environment: production console (utekos.no) + repository CSP builder
Conclusion: MUST_ALLOWLIST_REPORT_ONLY (not enforce flip)
```

## Observation

Production browser console (report-only, no hard block):

> Framing `https://www.facebook.com/` violates report-only
> `frame-src` … (Klarna, GTM, Cookiebot, vercel.live — no Facebook).

Source line attributed to `gtm.js?id=GTM-5TWMJQFP` (Meta Pixel loads via
web GTM under marketing consent).

## Verdict

Meta Pixel (`fbevents.js`) legitimately creates a hidden iframe to
`https://www.facebook.com/`. Official Meta CSP note documents
`script-src` for `https://connect.facebook.net`; framing of
`www.facebook.com` is observed runtime behavior and is required for
report-only cleanliness / future enforce readiness.

Already allowlisted in this repo for Meta:

- `script-src`: `https://connect.facebook.net`
- `connect-src` / `img-src`: `https://www.facebook.com` (+ OpenBridge)

Missing only: `frame-src https://www.facebook.com`.

Not noise to ignore if product policy keeps Meta Pixel under marketing
consent — report-only would become a hard break on enforce.

## Change

- File: `src/lib/security/buildReportOnlyCsp.ts`
- Add `META_PIXEL_FRAME_ORIGINS = ['https://www.facebook.com']` to
  report-only `frame-src` only.
- Do **not** flip Report-Only → enforce.
- Do **not** add OpenBridge hosts to `frame-src`.

## Non-goals

- Currency / Purchase value remediations (sibling agent)
- GTM publish
- Enforced CSP
