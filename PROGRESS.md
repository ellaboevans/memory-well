# Memory Well - Development Progress

Last Updated: February 3, 2026

---

## ✅ Completed Features

### Core Infrastructure

- [x] Next.js 16 with App Router & Turbopack
- [x] Convex serverless backend setup
- [x] Password authentication with JWT/JWKS
- [x] User profiles with tier system (free/premium)
- [x] Tailwind CSS v4 + shadcn/ui components

### Landing Page

- [x] Hero section with CTA
- [x] Features section
- [x] How it works section
- [x] Testimonials section
- [x] Pricing section
- [x] Footer

### Authentication

- [x] Sign up page
- [x] Sign in page
- [x] Email verification (Resend OTP)
- [x] Password reset flow
- [x] Protected dashboard routes
- [x] Auth state management

### Dashboard

- [x] Sidebar navigation
- [x] Walls list with entry counts
- [x] Create wall dialog
- [x] Wall detail page (view entries)
- [x] Edit wall page (settings & moderation)
- [x] Analytics dashboard (activity chart)
- [x] Billing page
- [x] Settings page (profile update)
- [x] Password change in settings

### Wall Features

- [x] Wall CRUD (create, read, update, delete)
- [x] Unique slug generation
- [x] Public/private toggle
- [x] Wall theming system
  - [x] 6 color presets (Midnight, Ocean, Forest, Sunset, Rose, Slate)
  - [x] Custom primary color picker
  - [x] Custom background color picker
  - [x] Font selection (4 fonts)
  - [x] Live preview
- [x] Cover image upload (Notion-style)
- [x] Cover image removal
- [x] Entry time window (open/close signing)

### Signature/Entry System

- [x] Public wall view page (`/wall/[slug]`)
- [x] Signature capture page (`/wall/[slug]/sign`)
- [x] Signature pad component (using signature_pad library)
  - [x] Smooth Bézier curve rendering
  - [x] Touch-friendly for mobile
  - [x] Clear functionality
  - [x] Data URL export
- [x] Entry submission (name, message, signature)
- [x] Entries display on wall page
- [x] Entry timestamps
- [x] Stickers/emojis (up to 3)

### Entry Moderation

- [x] Hide entry (soft delete / toggle visibility)
- [x] Delete entry (permanent)
- [x] Verify entry (badge)
- [x] Hidden entries shown to owner only

### Export

- [x] Export wall page (`/dashboard/walls/[wallId]/export`)
- [x] Export preview component
- [x] PDF export (jspdf + html2canvas)
- [x] PNG export
- [x] JPG export

### Payments (Polar.sh)

- [x] Polar SDK integration (@polar-sh/nextjs)
- [x] Checkout route (`/api/checkout`)
- [x] Webhook handler (`/api/webhooks/polar`)
- [x] One-time payment flow (lifetime premium)
- [x] Convex mutation to upgrade user to premium
- [x] Billing page with upgrade button

---

## 🔲 Remaining Features (from Spec)

### High Priority

- [x] **Analytics Dashboard** - Visitor counts, signature stats over time
- [x] **Rate Limiting** - Spam protection on public walls (per email)

### Medium Priority

- [ ] **Email Notifications** - Weekly/monthly activity digests for owners
- [ ] **Verified Badge** - Email verification for visitor entries
- [x] **QR Code Generation** - Easy wall sharing for events

### Low Priority / Future

- [ ] Embed code for websites
- [ ] Geo-insights for analytics
- [ ] Media uploads (photo/audio/video)
- [ ] Social sharing of wall snapshots
- [ ] Commenting/replying on entries
- [ ] Multi-owner collaborative walls

---

## 🔧 Technical Debt / Improvements

- [ ] Add loading states to more components
- [ ] Better error handling throughout
- [ ] Form validation improvements
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (a11y)
- [ ] Unit tests
- [ ] E2E tests

---

## 📁 Key Files Reference

### Frontend

- `app/(marketing)/page.tsx` - Landing page
- `app/(auth)/sign-in/page.tsx` - Sign in
- `app/(dashboard)/dashboard/page.tsx` - Dashboard home
- `app/(dashboard)/dashboard/walls/[wallId]/page.tsx` - Wall detail
- `app/(dashboard)/dashboard/walls/[wallId]/edit/page.tsx` - Wall editor
- `app/(dashboard)/dashboard/walls/[wallId]/export/page.tsx` - Export page
- `app/(dashboard)/dashboard/billing/page.tsx` - Billing
- `app/wall/[slug]/page.tsx` - Public wall view
- `app/wall/[slug]/sign/page.tsx` - Signature submission

### Backend (Convex)

- `convex/schema.ts` - Database schema
- `convex/walls.ts` - Wall queries/mutations
- `convex/entries.ts` - Entry queries/mutations
- `convex/profiles.ts` - Profile queries/mutations
- `convex/subscriptions.ts` - Payment handlers

### API Routes

- `app/api/checkout/route.ts` - Polar checkout
- `app/api/webhooks/polar/route.ts` - Polar webhooks

### Components

- `components/signature-pad.tsx` - Signature capture
- `components/export/ExportWallPreview.tsx` - Export preview
- `components/dashboard/sidebar.tsx` - Dashboard nav
- `components/dashboard/create-wall-dialog.tsx` - Create wall modal

---

## 🔑 Environment Variables Required

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=

# Polar Payments
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 📝 Notes

- Using Polar.sh for one-time lifetime payment ($9) instead of subscriptions
- Webhook needs to be configured in Polar dashboard pointing to `/api/webhooks/polar`
- For local webhook testing, use ngrok to expose localhost
- Premium product ID: `bd1b1f8b-f18a-4e0d-947c-00fd61f3b81a`
