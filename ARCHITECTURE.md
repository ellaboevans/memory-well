# Memory Well — Technical Architecture

## 1. Spec Clarification: Database

The SPEC mentions "Convex serverless backend" + "PostgreSQL database" — but **Convex uses its own document database**, not PostgreSQL. This is actually a benefit:

| Aspect                  | Convex Native DB | PostgreSQL             |
| ----------------------- | ---------------- | ---------------------- |
| Real-time subscriptions | Built-in ✅      | Needs Supabase/polling |
| Schema migrations       | Automatic ✅     | Manual                 |
| ACID transactions       | Yes ✅           | Yes                    |
| Relational joins        | Limited (manual) | Native                 |
| Scaling                 | Automatic        | Manual                 |

**Decision:** Use Convex's native document DB — it's purpose-built for this use case and gives us real-time wall updates out of the box.

---

## 2. Domain Model (DDD Bounded Contexts)

```
┌─────────────────────────────────────────────────────────────┐
│                      MEMORY WELL                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   IDENTITY      │    WALLS        │    BILLING              │
│   ─────────     │    ─────        │    ───────              │
│   • User        │    • Wall       │    • Subscription       │
│   • Session     │    • Entry      │    • Payment            │
│   • Auth        │    • Sticker    │    • Invoice            │
│                 │    • Export     │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

---

## 3. Directory Structure (Actual)

```
sign-dria/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages
│   ├── (auth)/                   # Auth pages (sign-in, sign-up, forgot-password)
│   ├── (dashboard)/              # Owner dashboard (protected)
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       ├── page.tsx          # Dashboard home
│   │       ├── billing/page.tsx
│   │       ├── settings/page.tsx
│   │       └── walls/
│   │           ├── page.tsx      # List walls
│   │           └── [wallId]/     # Wall detail/edit/export
│   ├── wall/[slug]/              # Public wall view + sign flow
│   │   ├── page.tsx
│   │   ├── sign/page.tsx
│   │   └── layout.tsx
│   ├── api/                      # Route handlers (Polar webhooks/checkout)
│   └── layout.tsx                # Root layout
│
├── convex/                       # Convex backend
│   ├── _generated/               # Auto-generated types
│   ├── schema.ts                 # Database schema
│   ├── auth.ts                   # Auth config (Convex Auth)
│   ├── users.ts                  # User queries/mutations
│   ├── walls.ts                  # Wall CRUD
│   ├── entries.ts                # Entry CRUD + moderation
│   ├── analytics.ts              # Dashboard analytics
│   ├── subscriptions.ts          # Polar billing logic
│   ├── account.ts                # Password change
│   ├── ownerDigests.ts           # Owner digest emails + crons
│   ├── entryNotifications.ts     # Entry verification emails
│   └── http.ts                   # HTTP actions (webhooks)
│
├── lib/                          # Shared utilities
│   ├── config.ts                 # URL helpers
│   └── utils.ts                  # Utility helpers
│
├── components/
│   ├── ui/                       # Base UI primitives
│   ├── auth/                     # Auth UI + dialogs
│   ├── dashboard/                # Dashboard UI
│   ├── export/                   # Export preview
│   └── signature-pad.tsx         # Signature capture
```

---

## 4. Key Technical Decisions & Tradeoffs

| Decision              | Options Considered                       | Choice                     | Rationale                                                         |
| --------------------- | ---------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| **Auth**              | Clerk, NextAuth, Convex Auth             | **Convex Auth**            | Native integration, no extra service, built-in session management |
| **Real-time**         | Polling, WebSockets, Convex              | **Convex subscriptions**   | Zero config, automatic cache invalidation                         |
| **File Storage**      | S3, Cloudinary, Convex                   | **Convex File Storage**    | Integrated, no CORS issues, automatic CDN                         |
| **Signature Capture** | Fabric.js, Signature Pad, Canvas API     | **signature_pad**          | Lightweight, touch-friendly, outputs base64/blob                  |
| **Export (PDF)**      | Puppeteer, react-pdf, jsPDF              | **jsPDF + html2canvas**    | Client-side export with preview                                   |
| **Payments**          | Stripe, Paystack, Polar                  | **Polar**                  | One-time lifetime upgrade flow                                    |
| **Styling**           | CSS Modules, Tailwind, styled-components | **Tailwind v4**            | Already set up, utility-first, great DX                           |
| **State**             | Redux, Zustand, Convex                   | **Convex + React Context** | Convex handles server state; Context for UI state                 |

---

## 5. Subdomain-Based Multi-Tenancy

### Routing Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUBDOMAIN ROUTING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  memorywell.app                 → Marketing/Landing             │
│  www.memorywell.app             → Marketing/Landing             │
│  app.memorywell.app             → Dashboard (authenticated)     │
│  {slug}.memorywell.app          → Public wall view              │
│  {slug}.memorywell.app/sign     → Wall signing form             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

**File: `proxy.ts`** (Next.js 16+ uses `proxy.ts` instead of `middleware.ts`)

```typescript
// Routing logic:
// 1. Extract subdomain from hostname
// 2. If "app" subdomain → rewrite to /dashboard routes
// 3. If other non-reserved subdomain → rewrite to /wall/{slug}
// 4. No subdomain or "www" → serve marketing pages
```

**Reserved Subdomains:**
- `app` - Dashboard
- `www` - Marketing redirect
- `api` - Future API subdomain
- `admin` - Future admin panel

### Internal Route Structure

```
app/
├── (marketing)/          # memorywell.app
│   └── page.tsx
├── (dashboard)/          # app.memorywell.app → rewrites to /dashboard
│   └── dashboard/
│       └── page.tsx
└── wall/[slug]/          # {slug}.memorywell.app → rewrites to /wall/{slug}
    ├── page.tsx          # Wall view
    ├── sign/page.tsx     # Signing form
    └── layout.tsx
```

### Local Development

For local subdomain testing:
```bash
# Add to /etc/hosts
127.0.0.1 memorywell.localhost
127.0.0.1 app.memorywell.localhost
127.0.0.1 my-wedding.memorywell.localhost
```

Then access:
- `http://memorywell.localhost:3000` → Marketing
- `http://app.memorywell.localhost:3000` → Dashboard
- `http://my-wedding.memorywell.localhost:3000` → Wall "my-wedding"

### Vercel Configuration

For production, configure wildcard domain in Vercel:
1. Add `memorywell.app` as primary domain
2. Add `*.memorywell.app` as wildcard subdomain
3. DNS: Add A record for root + wildcard CNAME

### Future: Custom Domains

For premium users wanting `guestbook.sarahswedding.com`:
1. User adds custom domain in dashboard
2. Store mapping in `walls` table: `customDomain: v.optional(v.string())`
3. User adds CNAME pointing to `cname.memorywell.app`
4. Proxy checks custom domain before subdomain extraction
5. SSL handled automatically by Vercel

---

## 6. Scalability Considerations

| Concern                     | Strategy                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| **High-traffic walls**      | Convex handles read scaling automatically; entries paginated      |
| **Large entry counts**      | Cursor-based pagination, indexes on `wallId + createdAt`          |
| **Image/signature storage** | Convex File Storage with automatic CDN                            |
| **Export generation**       | Client-side export via jsPDF + html2canvas                        |
| **Rate limiting**           | Convex rate-limiter component (per email)                         |
| **Multi-tenancy**           | All queries scoped by `ownerId`; row-level security patterns      |

---

## 6. Convex Schema (Actual)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("premium")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  walls: defineTable({
    ownerId: v.id("users"),
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    theme: v.object({
      primaryColor: v.string(),
      backgroundColor: v.string(),
      fontFamily: v.string(),
    }),
    visibility: v.union(v.literal("private"), v.literal("public")),
    acceptingEntries: v.boolean(),
    entryWindowStart: v.optional(v.number()),
    entryWindowEnd: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"]),

  entries: defineTable({
    wallId: v.id("walls"),
    name: v.string(),
    message: v.optional(v.string()),
    signatureImageId: v.optional(v.id("_storage")),
    stickers: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    isVerified: v.boolean(),
    isHidden: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_wall", ["wallId"])
    .index("by_wall_created", ["wallId", "createdAt"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    polarCustomerId: v.string(),
    polarOrderId: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
      v.literal("trialing"),
    ),
    currentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

---

## 7. Implementation Phases

| Phase             | Scope                                             | Deliverable                            |
| ----------------- | ------------------------------------------------- | -------------------------------------- |
| **1. Foundation** | Convex setup, schema, auth                        | Working sign-in/sign-up, user creation |
| **2. Walls CRUD** | Create/read/update/delete walls                   | Owner can manage walls from dashboard  |
| **3. Entry Flow** | Public wall view, signature pad, entry submission | Visitors can sign walls                |
| **4. Theming**    | Wall customization UI, live preview               | Owners personalize walls               |
| **5. Moderation** | Hide/delete entries, verification badges          | Owner moderation tools                 |
| **6. Export**     | PDF/image generation                              | Downloadable wall exports              |
| **7. Billing**    | Polar integration, lifetime upgrade               | Freemium enforcement                   |
| **8. Polish**     | Analytics, notifications, SEO                     | Production readiness                   |

---

## 8. Open Questions

1. **Auth flow**: Email/password only for MVP, or add Google/social login?
2. **Slug generation**: Auto-generate from title, or let owner pick custom slug?
3. **Stickers**: Pre-defined set, or allow custom uploads?
4. **Analytics depth**: Simple counts, or time-series charts?

---

## 9. Dependencies (Actual)

```bash
# Convex
pnpm add convex @convex-dev/auth @convex-dev/rate-limiter @convex-dev/crons

# Signature capture
pnpm add signature_pad

# PDF export
pnpm add jspdf html2canvas

# Paystack
pnpm add @polar-sh/nextjs

# Utilities
pnpm add date-fns qrcode
```

---

## 10. Environment Variables (Actual)

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=

# Polar
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=
```
