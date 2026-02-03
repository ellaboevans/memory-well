# Memory Well 🌊

A multi-tenant digital guestbook platform for preserving memories. Create beautiful, customizable walls where visitors can leave signatures, messages, and heartfelt notes for weddings, memorials, graduations, and any special occasion.

![Memory Well](https://img.shields.io/badge/Next.js-16-black) ![Convex](https://img.shields.io/badge/Convex-Serverless-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

- **Create Memory Walls** - Beautiful, themed walls for any occasion
- **Signature Pad** - Smooth, touch-friendly signature capture with Bézier curves
- **Custom Theming** - 6 color presets + custom colors and fonts
- **Cover Images** - Notion-style cover image upload
- **Entry Moderation** - Hide, delete, or verify visitor entries
- **Export** - Download walls as PDF, PNG, or JPG
- **One-Time Payment** - Lifetime premium access via Polar.sh

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack)
- **Backend**: Convex (serverless functions + real-time database)
- **Auth**: Convex Auth with Password provider
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Payments**: Polar.sh
- **Signature**: signature_pad library
- **Export**: html2canvas + jspdf

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Convex account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ellaboevans/memory-well.git
   cd memory-well
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local`:

   ```env
   CONVEX_DEPLOYMENT=your-convex-deployment
   NEXT_PUBLIC_CONVEX_URL=your-convex-url
   NEXT_PUBLIC_CONVEX_SITE_URL=your-convex-site-url
   POLAR_ACCESS_TOKEN=your-polar-token
   POLAR_WEBHOOK_SECRET=your-polar-webhook-secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Start Convex backend:

   ```bash
   npx convex dev
   ```

6. Start the development server:

   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
memory-well/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Landing page
│   ├── (auth)/             # Sign in/up pages
│   ├── (dashboard)/        # Protected dashboard
│   ├── api/                # API routes (checkout, webhooks)
│   └── wall/[slug]/        # Public wall pages
├── components/             # React components
│   ├── ui/                 # shadcn/ui primitives
│   ├── dashboard/          # Dashboard components
│   ├── export/             # Export components
│   └── landing/            # Landing page sections
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── walls.ts            # Wall mutations/queries
│   ├── entries.ts          # Entry mutations/queries
│   └── subscriptions.ts    # Payment handlers
└── lib/                    # Utilities
```

## 🎨 Wall Themes

Memory Well includes 6 built-in color presets:

- **Midnight** - Deep purple elegance
- **Ocean** - Calm blue tones
- **Forest** - Natural green hues
- **Sunset** - Warm orange glow
- **Rose** - Soft pink aesthetics
- **Slate** - Modern neutral gray

Plus custom color pickers for primary and background colors.

## 💳 Payments

Memory Well uses [Polar.sh](https://polar.sh) for one-time lifetime payments:

- **Free Tier**: 3 walls, 50 signatures per wall, basic themes
- **Premium**: Unlimited walls, unlimited signatures, all themes, export, custom branding

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

---

Built with ❤️ by [Evans Ellaboevans](https://github.com/ellaboevans)
