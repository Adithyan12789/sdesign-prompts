# S_de_sign prompts — Architectural AI Prompt & Guide Library

A premium, production-ready resource library for AI architectural video
creation: prompts, step-by-step guides, workflows and downloadable
bundles, organised by category, AI platform and difficulty. This is a
content library — it contains **no AI generation functionality**.

Built with Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 +
Framer Motion + Firebase (Firestore, Authentication and Storage).

## Quick start

```bash
npm install
cp .env.example .env.local     # Firebase client keys, service account,
                               # DOWNLOAD_TOKEN_SECRET, ADMIN_* values
npm run seed                   # categories, platforms, placeholder
                               # resources, homepage content, admin user
npm run dev                    # http://localhost:3000
```

Firebase setup (one project covers everything): enable **Email/Password**
sign-in under Authentication, create a **Firestore** database, and keep
the default **Storage** bucket private. The `NEXT_PUBLIC_FIREBASE_*`
values come from your web app's Firebase config; the service account
JSON comes from Project settings → Service accounts.

Without Firebase configured the site still runs for review: public pages
and the API serve the built-in placeholder library, and downloads work
(files are generated on request and kept on local disk). Accounts, admin
editing, favorites, history, cloud storage and live analytics activate
as soon as Firebase is connected and seeded.

## What's inside

**Public site**
- Cinematic hero — the architectural image reveals first, then the
  headline rises in; subtle parallax; reduced-motion respected.
- Featured resources, category browsing, latest additions, popular
  downloads chart, studio introduction, newsletter signup, premium
  footer with socials.
- Library page with search, category / type / platform / access
  filters, newest & most-downloaded sorting, pagination, loading
  skeletons and an empty state.
- Resource pages with cover, platform compatibility, difficulty, a
  prompt viewer with copy button, step-by-step guide, reference
  gallery, preview video, related resources, favorites and sharing,
  plus per-resource SEO metadata / Open Graph.

**Downloads (secure)**
- TXT, PDF and ZIP files plus reference images, per-file or as bundles.
- Files live in **Firebase Storage** (private bucket). The client never
  sees a storage key or path: the API validates access first (premium
  resources require a signed-in account), then issues a **signed,
  10-minute download URL**, streams the file itself, and counts and logs
  every download. (In unconfigured review mode, files fall back to a
  private local folder with the same flow.)

**Accounts**
- Register / login with **Firebase Authentication** (email + password;
  passwords never touch this app's code or database). The server
  exchanges the sign-in for an httpOnly Firebase session cookie.
  Profiles carry favorites, recently viewed and download history, with
  an optional newsletter subscription.

**Admin** (`/admin`, admin role required)
- Analytics dashboard: totals, most-downloaded, recent download log.
- Full resource editor: all fields, prompt, instruction steps,
  platform multi-select, free/premium, featured, draft/published, and
  uploads for thumbnail, gallery images, preview video and
  TXT/PDF/ZIP/image files (type- and size-validated).
- Category and AI platform management (in-use items cannot be deleted),
  user management (roles, delete), homepage content editor.

## Content note

The seeded library is **placeholder example content**, visibly labelled
as such in the interface, so the whole product can be reviewed before
real material exists. Replace it with genuine prompts and guides
through the admin dashboard — no code changes needed.

## Architecture (Next.js App Router)

```text
src/
├── app/
│   ├── (main)/                   # Public site route group
│   │   ├── layout.tsx            # Main layout (Navbar, Footer, site content)
│   │   ├── page.tsx              # Homepage (/)
│   │   ├── profile/              # User library & favorites (/profile)
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── resources/            # Prompts & guides catalog (/resources)
│   │       ├── [slug]/           # Resource detail page (/resources/:slug)
│   │       │   ├── loading.tsx
│   │       │   └── page.tsx
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── (auth)/                   # Authentication route group
│   │   ├── layout.tsx            # Minimal auth shell (branding + back link)
│   │   ├── login/                # Sign-in page (/login)
│   │   └── register/             # Registration page (/register)
│   ├── admin/                    # Studio admin area (/admin)
│   │   ├── layout.tsx            # Admin dashboard layout (admin topbar + sidebar)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── page.tsx              # Analytics dashboard
│   │   ├── categories/page.tsx
│   │   ├── content/page.tsx
│   │   ├── platforms/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── resources/[id]/page.tsx
│   │   └── users/page.tsx
│   ├── api/                      # App Router Route Handlers
│   │   └── ...
│   ├── error.tsx                 # Root client error boundary
│   ├── global-error.tsx          # Root fallback global error boundary
│   ├── loading.tsx               # Root suspense loading UI
│   ├── not-found.tsx             # 404 handler
│   ├── layout.tsx                # HTML root shell (metadata, fonts, globals.css)
│   ├── robots.ts                 # Dynamic robots.txt metadata route
│   └── sitemap.ts                # Dynamic sitemap.xml metadata route
├── components/
│   ├── layout/                   # Navbar, Footer
│   ├── home/                     # Hero
│   ├── auth/                     # AuthForm
│   ├── resources/                # ResourceCard, Interactive widgets
│   ├── ui/                       # Reveal, shared animations
│   └── index.ts                  # Centralized component exports
└── lib/                          # Data, Auth, Firebase, Utilities
```

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Web app config (client sign-in) |
| `FIREBASE_SERVICE_ACCOUNT` | Service-account JSON, one line (or use `GOOGLE_APPLICATION_CREDENTIALS`) |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket name |
| `DOWNLOAD_TOKEN_SECRET` | Download link signing |
| `ADMIN_NAME/EMAIL/PASSWORD` | Admin account created by the seed |
| `NEXT_PUBLIC_SITE_NAME` | Display name |

## Production

```bash
npm run build && npm run start
```

Serve behind HTTPS (session cookies are marked secure in production).
Firebase scales with the library: Firestore for content and accounts,
Firebase Storage for the downloadable files, all behind the same
signed-token download flow.
