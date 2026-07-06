# Klarna — lokale agent-dokumenter

`dev/`, `llms.md`, `klarna-sitemap.md` og `README.md` i denne
mappen er **kun for lokale agenter**. De er gitignored og
deployes ikke til GitHub eller Vercel. Runtime-kode
(`components/`, `types/`, `utils/`) og [agents.txt](./agents.txt)
ligger fortsatt i repoet.

## Første gangs oppsett

1. Legg Klarna-dokumentspeilet i `src/components/klarna/dev/`
   (samme struktur som i [agents.txt](./agents.txt)).
2. Kjør pipeline:

```bash
npm run normalize:klarna-docs
npm run inject:klarna-docs
npm run index:klarna-docs
npm run validate:klarna-docs
```

3. Start agentarbeid via [agents.txt](./agents.txt) → generert
   [llms.md](./llms.md).

## Hva som er lokalt vs. committet

| Sti                               | Git | Vercel              | Agenter                       |
| --------------------------------- | --- | ------------------- | ----------------------------- |
| `dev/`                            | Nei | Nei                 | Ja (lokal disk)               |
| `llms.md`                         | Nei | Nei                 | Ja (generert lokalt)          |
| `klarna-sitemap.md`               | Nei | Nei                 | Ja (deprecated; bruk llms.md) |
| `README.md`                       | Nei | Nei                 | Ja (runtime-notater)          |
| `agents.txt`                      | Ja  | Ja                  | Ja                            |
| `LOCAL_DOCS.md`                   | Ja  | Ja                  | Ja                            |
| `components/`, `types/`, `utils/` | Ja  | Ja                  | Ja                            |
| `scripts/klarna-docs/`            | Ja  | Nei (ikke i bundle) | Ja                            |

## Hvorfor dette fungerer for agenter

- Cursor/Codex leser **lokal filsystem** — `.gitignore` skjuler
  ikke filer for agenter.
- `.cursorignore` inneholder **ikke** Klarna-stier, så
  indeksering og `Read` fungerer.
- Uten commit når ikke doc-speilet GitHub eller Vercel-build.

## Ved manglende `dev/`

Agenter kan fortsatt bruke committet runtime-kode og
[agents.txt](./agents.txt), men må hente live
Klarna-dokumentasjon via Context7 (`ctx7 library klarna "…"`)
inntil lokalt speil er på plass.
