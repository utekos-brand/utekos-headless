# Comfyrobe Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build `/comfyrobe` as a complete Shopify-backed purchase landing page for paid media traffic.

**Architecture:** Fetch Comfyrobe once in a cached Server Component, pass the serialized product into a focused purchase Client Component, and render all non-interactive persuasion sections as Server Components. Reuse the existing variant, Klarna, cart and canonical analytics pipeline.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Shopify Storefront data, TanStack-independent server-to-client product handoff, existing canonical analytics and cart components.

## Global Constraints

- Public route is exactly `/comfyrobe`.
- Full purchase flow remains on the page.
- Mobile-first, responsive through large screens.
- Use existing theme variables and Utekos typography only.
- Do not add dependencies, provider-specific tracking or duplicate cart transports.
- Do not invent reviews, scarcity, performance data or product claims.
- Preserve canonical `view_item` and Add to Cart event behavior.

---

### Task 1: Define landing content and deterministic gallery order

**Files:**
- Create: `src/app/comfyrobe/data/comfyrobeLandingContent.ts`
- Create: `src/app/comfyrobe/utils/getComfyrobeLandingGalleryImages.ts`
- Create: `src/app/comfyrobe/utils/getComfyrobeLandingGalleryImages.test.ts`

- [x] Add factual scenario, technical-feature and FAQ content.
- [x] Place a lifestyle image first and a clear product image second.
- [x] Test order, uniqueness and complete image coverage.

### Task 2: Build the Shopify-backed purchase hero

**Files:**
- Create: `src/app/comfyrobe/components/ComfyrobePurchaseExperience.tsx`

- [x] Use `useVariantState` and existing product option renderers.
- [x] Report canonical `view_item` with existing deduplication key logic.
- [x] Reuse `PriceActivityPanel`, Klarna, `AddToCart` and `TrustSignals`.
- [x] Keep heading/copy separate from photography.

### Task 3: Build persuasive landing sections

**Files:**
- Create: `src/app/comfyrobe/components/ComfyrobeBenefitStrip.tsx`
- Create: `src/app/comfyrobe/components/ComfyrobeScenarioTabs.tsx`
- Create: `src/app/comfyrobe/components/ComfyrobeTechnicalProofSection.tsx`
- Create: `src/app/comfyrobe/components/ComfyrobeFitSection.tsx`
- Create: `src/app/comfyrobe/components/ComfyrobeFaqSection.tsx`
- Create: `src/app/comfyrobe/components/ComfyrobeFinalCta.tsx`

- [x] Expand usage contexts without narrowing the product to one niche.
- [x] Implement accessible tabs and native FAQ disclosure controls.
- [x] Use only existing product assets and supported specifications.

### Task 4: Compose server route, metadata and loading state

**Files:**
- Create: `src/app/comfyrobe/components/AsyncComfyrobeLandingPage.tsx`
- Create: `src/app/comfyrobe/components/ComfyrobeLandingSkeleton.tsx`
- Create: `src/app/comfyrobe/page.tsx`
- Create: `src/app/comfyrobe/loading.tsx`

- [x] Fetch through `getCachedProductPageData('comfyrobe')`.
- [x] Resolve deep-linked initial variants through existing query-param logic.
- [x] Add canonical, Open Graph and Twitter metadata for `/comfyrobe`.
- [x] Stream a stable mobile-first skeleton while product data resolves.

### Task 5: Verify and release through preview

- [ ] Run `pnpm exec tsx --test src/app/comfyrobe/utils/getComfyrobeLandingGalleryImages.test.ts`.
- [ ] Run project lint/type/build checks in GitHub/Vercel CI.
- [ ] Review `/comfyrobe` in the Vercel preview at mobile and desktop widths.
- [ ] Verify variant selection, Add to Cart, cart opening and canonical `view_item`/`add_to_cart` behavior.
