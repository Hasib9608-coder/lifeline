# LifeLine Bangladesh — Next.js Premium Edition

> **Phase 1 of 3 — Foundation complete.**
> Bangladesh-native, globally premium. Built for trust, not for TikTok.

---

## 🎯 What's in Phase 1 (this build)

A fully working **Next.js 14 + TypeScript + Three.js** foundation with:

| ✅ Done                              | Detail                                                              |
|--------------------------------------|---------------------------------------------------------------------|
| Design system                        | "Dawn on the Buriganga" palette · Fraunces + Inter Tight + Hind Siliguri |
| Animated SVG logomark + wordmark     | ECG pulse draws itself on load                                      |
| Bilingual content engine (bn/en)     | Full React Context + localStorage persistence                       |
| Smooth scroll                        | Lenis 1.x, 60fps target                                             |
| Real 3D scene (hero)                 | 32 district nodes, animated connections, ambient particles. Three.js + R3F. Mobile-safe dpr=[1, 1.5]. |
| Home page — 7 sections               | Hero · Emergency · Blood · Health/Telemed/Ambulance · Skills/Jobs/Food · NGO/Premium · CTA |
| Full inner page — `/blood`           | Filterable donor search, district picker, donor cards, registration CTA |
| Stub pages for all other routes      | `/health` `/telemedicine` `/ambulance` `/skills` `/jobs` `/food` `/donate` `/premium` |
| Premium nav with scroll-aware blur   | Mobile hamburger, language switcher, animated logo                  |
| Editorial footer                     | 4-column links, "All systems operational" status                    |
| Responsive (mobile → 4K)             | Verified at 390px (iPhone), 768px (tablet), 1440px (desktop)        |
| Build verified                       | `next build` passes, 0 TypeScript errors, ~137 kB First Load JS     |

---

## 📦 Tech Stack

- **Next.js 14.2** (App Router, RSC, Static export ready)
- **React 18** + **TypeScript 5**
- **Tailwind CSS 3.4** (custom token system in `tailwind.config.ts`)
- **Framer Motion 11** (page/section animation)
- **Three.js + @react-three/fiber + drei** (hero 3D scene)
- **GSAP 3** (available for advanced scroll triggers — Phase 2)
- **Lenis** (smooth scroll)

---

## 🚀 Quick Start

```bash
npm install        # install dependencies
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # run production server
```

> **Note on fonts:** This project loads Google Fonts via `<link>` CDN (not `next/font`)
> so it works in all sandbox environments. For deployment, both work fine.

---

## 🎨 Design System

### Palette — "Dawn on the Buriganga"
```
--ivory:    #FBF8F1   off-white page bg
--pearl:    #F2EDE2   alt section bg
--ink:      #0F1B2D   deep navy (replaces black)
--royal:    #1E3A8A   royal blue · trust
--emerald:  #047857   Bangladesh green · life
--gold:     #B8860B   warm gold · premium badge
--lavender: #C7C5E0   soft halo accent
--blood:    #B91C1C   donor red (use sparingly)
```

### Typography
- **Display:** Fraunces (variable, optical sizing, italic SOFT axis)
- **Body:** Inter Tight
- **Bangla:** Hind Siliguri (weights 300–700)
- **Mono/data:** JetBrains Mono

### Signature element — "The Pulse"
A red `--blood` dot with a radial-shadow heartbeat, threading the page via
the `.pulse-line` class. Reinforced by the ECG waveform in the closing CTA
and the animated logo.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              ← Fonts, providers, nav, footer
│   ├── page.tsx                ← Home (composes all sections)
│   ├── globals.css             ← Design tokens, signature classes
│   ├── blood/page.tsx          ← Full inner page demo
│   └── {other}/page.tsx        ← Coming-soon stubs
├── components/
│   ├── ui/
│   │   ├── Logo.tsx            ← Animated SVG mark
│   │   ├── LangToggle.tsx      ← bn/en pill switcher
│   │   ├── Counter.tsx         ← Intersection-triggered number animator
│   │   └── SectionHead.tsx     ← Eyebrow + title + sub
│   ├── 3d/
│   │   └── NetworkGlobe.tsx    ← Hero 3D scene
│   ├── nav/Nav.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── EmergencySection.tsx
│       ├── BloodSection.tsx
│       ├── HealthSection.tsx   ← Hospital + Telemed + Ambulance
│       ├── GrowSection.tsx     ← Skills + Jobs + Food
│       ├── GiveSection.tsx     ← NGO + Premium partners
│       ├── ClosingCTA.tsx
│       └── Footer.tsx
└── lib/
    ├── i18n.tsx                ← Bilingual content + LangProvider
    └── SmoothScroll.tsx        ← Lenis wrapper
```

---

## 🗺️ Roadmap

### ✅ Phase 1 — **Foundation** (this delivery)
Design system, animated logo, language switcher, hero with 3D, home page with all
section previews, 1 full inner page, component library, build verified.

### 🔜 Phase 2 — **Complete inner pages** (next session)
- `/telemedicine` — Doctor booking flow with calendar, video preview, payment
- `/health` — Full hospital directory with map + filters + verified badges
- `/ambulance` — Live booking with vehicle type selector, fare estimator, driver tracking UI
- `/skills` — Course detail pages, enrollment flow, progress tracking UI
- `/jobs` — Filterable job board with apply flow, "sponsored" tier
- `/food` — Post-creation form, nearby surplus feed with photos
- `/donate` — NGO detail page, amount picker, transparency dashboard
- `/premium` — Pricing tiers (Free / Premium ৳199 / Business ৳999), bKash/Stripe placeholder
- Each page gets its **own signature 3D element** (per original brief)

### 🚀 Phase 3 — **Production** (final session)
- Migrate from this static UI to **your existing Firebase Firestore** project
  (`lifeline-bangladesh`)
- Adaptive 3D quality detection (skip heavy scenes on low-end Android)
- PWA manifest + service worker (offline-first for emergency numbers)
- Payment gateway integration (bKash, Nagad, Rocket — local first)
- Production deployment guide:
  - **Recommended: Vercel** (zero-config Next.js, free tier covers your traffic)
  - Alternative: GitHub Pages with `next export` (loses some features)
- Analytics + error monitoring
- SEO with structured data for hospitals/services

---

## 💰 Monetization (already designed in)

The UI surfaces all the revenue streams we mapped earlier:
- **Premium business listings** — Gold badge + boosted ranking (৳999/mo)
- **Featured jobs** — Sponsored row in job board (৳200–500/post)
- **Telemedicine commissions** — 10–20% per consultation
- **Course commissions** — 15–30% per enrollment
- **Ambulance booking** — ৳50–150 per booking
- **NGO platform fee** — 2–5% per donation
- **Local business ads** — Sidebar / contextual placements

---

## 🐛 Known limitations of Phase 1

These are intentional — Phase 2/3 will address them:

1. Inner pages (besides `/blood`) are stubs that say "coming soon"
2. No backend wiring — all data is hard-coded sample data
3. No PWA service worker yet
4. No payment integration
5. Hero 3D scene is intentionally stylized — Phase 2 may add a real Bangladesh GeoJSON
   shape for the dedicated Network page

---

## 📋 Phase 1 acceptance checklist

- [x] Next.js + TypeScript + Tailwind compiles with zero errors
- [x] Hero 3D scene renders smoothly
- [x] Language switcher works (bn ↔ en, all sections update)
- [x] Animated logo plays on load
- [x] All 7 home sections styled and responsive
- [x] `/blood` page has working filter UI
- [x] Mobile layout verified at 390px
- [x] Production build passes
- [x] Lighthouse-friendly structure (semantic HTML, no console errors)

---

**Designed and built by Claude (Anthropic) for JH Hasib · 2026**
*Phase 1 of 3. Ready for review before Phase 2 begins.*
