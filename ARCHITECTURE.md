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

## 3. Directory Structure

```
sign-dria/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages (landing, about)
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── (auth)/                   # Auth pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/              # Owner dashboard (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard home
│   │   └── walls/
│   │       ├── page.tsx          # List walls
│   │       ├── new/page.tsx      # Create wall
│   │       └── [wallId]/         # Wall detail/edit
│   ├── w/[slug]/                 # Public wall view (visitor signing)
│   │   ├── page.tsx
│   │   └── success/page.tsx
│   ├── api/                      # Route handlers (webhooks, exports)
│   └── layout.tsx                # Root layout
│
├── convex/                       # Convex backend
│   ├── _generated/               # Auto-generated types
│   ├── schema.ts                 # Database schema
│   ├── auth.ts                   # Auth config
│   ├── users.ts                  # User queries/mutations
│   ├── walls.ts                  # Wall CRUD
│   ├── entries.ts                # Entry (signature) CRUD
│   ├── subscriptions.ts          # Billing logic
│   └── http.ts                   # HTTP actions (webhooks)
│
├── lib/                          # Shared utilities
│   ├── convex.ts                 # Convex client setup
│   ├── validators.ts             # Shared Zod/Convex validators
│   └── constants.ts              # App-wide constants
│
├── components/
│   ├── ui/                       # Base UI primitives (existing)
│   ├── walls/                    # Wall-specific components
│   │   ├── WallCard.tsx
│   │   ├── WallEditor.tsx
│   │   └── EntryCard.tsx
│   ├── signature/                # Signature capture
│   │   ├── SignaturePad.tsx
│   │   └── StickerPicker.tsx
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useWall.ts
│   ├── useEntries.ts
│   └── useSubscription.ts
│
└── types/                        # TypeScript types
    └── index.ts
```

---

## 4. Key Technical Decisions & Tradeoffs

| Decision              | Options Considered                       | Choice                     | Rationale                                                         |
| --------------------- | ---------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| **Auth**              | Clerk, NextAuth, Convex Auth             | **Convex Auth**            | Native integration, no extra service, built-in session management |
| **Real-time**         | Polling, WebSockets, Convex              | **Convex subscriptions**   | Zero config, automatic cache invalidation                         |
| **File Storage**      | S3, Cloudinary, Convex                   | **Convex File Storage**    | Integrated, no CORS issues, automatic CDN                         |
| **Signature Capture** | Fabric.js, Signature Pad, Canvas API     | **react-signature-canvas** | Lightweight, touch-friendly, outputs base64/blob                  |
| **Export (PDF)**      | Puppeteer, react-pdf, jsPDF              | **@react-pdf/renderer**    | Server-side rendering, styled components                          |
| **Payments**          | Stripe, Paystack                         | **Paystack**               | Spec requirement (Ghana support)                                  |
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
| **Export generation**       | Background job via Convex actions (async, non-blocking)           |
| **Rate limiting**           | Convex built-in rate limiting + custom throttle on entry creation |
| **Multi-tenancy**           | All queries scoped by `ownerId`; row-level security patterns      |

---

## 6. Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("premium")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

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
    isVerified: v.boolean(),
    isHidden: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_wall", ["wallId"])
    .index("by_wall_created", ["wallId", "createdAt"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    paystackCustomerId: v.string(),
    paystackSubscriptionId: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
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
| **7. Billing**    | Paystack integration, subscription management     | Freemium enforcement                   |
| **8. Polish**     | Analytics, notifications, SEO                     | Production readiness                   |

---

## 8. Open Questions

1. **Auth flow**: Email/password only for MVP, or add Google/social login?
2. **Slug generation**: Auto-generate from title, or let owner pick custom slug?
3. **Stickers**: Pre-defined set, or allow custom uploads?
4. **Analytics depth**: Simple counts, or time-series charts?

---

## 9. Dependencies to Add

```bash
# Convex
pnpm add convex @convex-dev/auth

# Signature capture
pnpm add react-signature-canvas
pnpm add -D @types/react-signature-canvas

# PDF export
pnpm add @react-pdf/renderer

# Paystack
pnpm add @paystack/inline-js

# Utilities
pnpm add nanoid slugify date-fns
```

---

## 10. Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Paystack
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# App
NEXT_PUBLIC_APP_URL=
```
