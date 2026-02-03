Memory Well - Digital Guestbook Application Specification

1. Overview & Concept

Memory Well is a multi-tenant, mobile-first, responsive web application that allows users to create digital guestbook-style walls to preserve personal, event-based, or organizational memories. Visitors can leave signatures, short messages, and symbolic marks. The platform emphasizes legacy preservation, integrity, and expressive personalization.

The core philosophy is integrity-focused: visitor entries are immutable once submitted, while wall owners retain moderation control. Walls can be private or public, and the platform supports freemium and premium features for scalability and monetization.

⸻

2. User Types & Roles

2.1 Wall Owner
• Single owner per wall.
• Can create up to 3 free walls; additional walls require premium subscription.
• Manages wall customization, moderation, and analytics.
• Accesses a central dashboard to manage multiple walls.

2.2 Visitor / Guest
• Can leave a signature and optional short message on walls.
• Can add stickers, emojis, and freestyle drawn signatures.
• No account required; optional email/contact for verification badge.
• Entries are auto-published and cannot be edited or deleted by visitor.

⸻

3. Wall Features

3.1 Creation & Ownership
• Tied to a single owner account.
• Up to 3 walls free; extra walls require premium subscription.
• Each wall is independent in theming and content.

3.2 Visibility & Access
• Private by default; owner can toggle public/searchable.
• Visitors access walls via shared link.
• Wall entries auto-published.

3.3 Entry Structure
• Visitor provides:
• Name (required)
• Short text message (optional)
• Stickers/emojis (optional)
• Freestyle drawn signature (signature pad)
• Media uploads (photo/audio/video) planned for future version.
• Entries are auto-stamped with date/time.
• Guest entries are immutable; wall owner can soft-delete or permanently delete entries.

3.4 Customization
• Wall title, description/context.
• Full theming (colors, fonts, backgrounds).
• Cover image / hero section.
• Optional time window for accepting entries.
• Expressive and personalized for each wall/event.

3.5 Notifications & Analytics
• Owners receive weekly/monthly digests of activity.
• Verified visitors notified if their entry receives verification.
• Analytics for owners include:
• Number of visitors/signatures over time
• Recent activity
• Popular stickers/emojis
• Optional geo-insights

3.6 Export / Portability
• Owners can export walls as:
• Print-ready PDF
• High-resolution image
• All signatures/messages/stickers appear together on a single page.

⸻

4. Payments & Monetization
   • Freemium model:
   • Free tier: up to 3 walls, basic theming, no analytics/export.
   • Premium tier: additional walls, full theming, analytics, export options, verified badge support.
   • Payment provider: Paystack (supports Ghanaian users).
   • Subscription-based access for extra walls and premium features.

⸻

5. Tech Stack
   • Frontend: Mobile-first, responsive web app.
   • Backend: Convex serverless backend.
   • Database: PostgreSQL.
   • Signature capture: Canvas-based, touch-friendly.
   • Export generation: PDF/image rendering library.

⸻

6. Security & Privacy
   • Encryption in transit and at rest.
   • Optional visitor emails stored securely, GDPR/POPIA compliant.
   • Rate-limiting and spam protection for visitor entries.
   • Owner authentication via secure email/password (future: passwordless/social login).
   • Integrity-focused: visitor entries immutable, owner moderation only.

⸻

7. Integrity & Moderation
   • Visitor entries cannot be edited or deleted once submitted.
   • Wall owner can:
   • Soft-delete entries (hide)
   • Permanently delete entries
   • Optional verification badges for visitors (manual verification by owner).

⸻

8. Future Roadmap / v2 Features
   • Media uploads (photo, audio, video) for visitor entries.
   • Blockchain-based immutability for verified walls.
   • Social sharing of wall snapshots.
   • Commenting/replying on visitor entries.
   • Multi-owner collaborative walls.

⸻

9. Summary

Memory Well is a personal, expressive, and integrity-first digital guestbook platform, designed for preserving memories in a structured, visually appealing, and trustworthy way. The MVP focuses on signature-based guest entries, wall customization, analytics, export, and freemium monetization, with a roadmap for media-rich, blockchain-backed, and interactive experiences.
