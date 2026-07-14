# sGTM Release 2 progress

- Release 1: published and immediately smoke-tested before this continuation.
- Baseline 2026-07-12T23:31Z: 84 tracking tests passed; TypeScript passed; `git diff --check` passed.
- Live baseline: web GTM 108, server GTM 23, server client 6 fingerprint 1783840862217.
- Supabase baseline: canonical project hkoawfbomhnzupcsdggb; migration 20260712120000 not applied; `ops.tagging_observations` absent.
- Cloud Run baseline: max 5, min 0, concurrency 80; no uptime checks or alert policies; no Secret Manager secrets.
- Vercel baseline: connector authenticated to team utekos-marketing-group and project utekos-headless; local CLI not installed.
- Task 1: PASS after three commits through `0978332cd30e1ff7b7958f38b922cdbff4d1ba7d`; independent review found no remaining Critical, Important or Minor code findings. Local verification reached 107 tests plus TypeScript, smoke syntax and diff checks. Live provider and warehouse evidence remains gated.
- Task 2: PASS after three commits through `88dddee4d`; independent review found no remaining Critical, Important or Minor code findings. Local verification reached 117 tests, TypeScript, production build, Supabase linked lint and a dry-run proving only migration `20260712120000` is pending. Live migration, deploy, webhook subscription and refund remain gated.
